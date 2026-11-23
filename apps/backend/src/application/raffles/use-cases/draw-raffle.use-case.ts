import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../domain/errors/domain.errors.js';
import { assertOpen, canDraw } from '../../../domain/rules/raffle.rules.js';
import { secureRandomIndex } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { DrawResultDto, OwnedRaffleRefDto } from '../dto/raffle.dto.js';
import { findWinner, requireOwnedRaffle } from '../raffle.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class DrawRaffleUseCase implements UseCase<OwnedRaffleRefDto, DrawResultDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute({ userId, raffleId }: OwnedRaffleRefDto): Promise<DrawResultDto> {
    const raffle = await requireOwnedRaffle(this.raffles, userId, raffleId);
    assertOpen(raffle);
    const counts = await this.orders.countNumbers(raffle.id);
    if (counts.paid === 0) throw new BusinessRuleError('Ainda não há números pagos para sortear.');
    if (!canDraw(raffle, counts)) {
      throw new BusinessRuleError('O sorteio só pode ser feito com a rifa completa ou a partir da data do sorteio.');
    }

    await this.unitOfWork.run(async () => {
      const paid = (await this.orders.listTakenNumbers(raffle.id)).filter((t) => t.status === 'paid');
      const winner = paid[secureRandomIndex(paid.length)].number;
      for (const orderId of await this.orders.listPendingIds(raffle.id)) {
        await this.orders.release(orderId, 'cancelled');
      }
      await this.raffles.markDrawn(raffle.id, winner, Date.now());
    });

    const drawn = (await this.raffles.findById(raffle.id))!;
    return { winner: findWinner(drawn, await this.orders.listTakenNumbers(raffle.id)) };
  }
}
