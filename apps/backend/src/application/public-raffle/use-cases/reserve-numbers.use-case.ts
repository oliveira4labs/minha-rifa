import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError, NotFoundError, NumbersUnavailableError } from '../../../domain/errors/domain.errors.js';
import { assertIntInRange, assertOpen } from '../../../domain/rules/raffle.rules.js';
import { newOrderToken } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { ReservationDto, ReserveNumbersInput } from '../dto/public-raffle.dto.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class ReserveNumbersUseCase implements UseCase<ReserveNumbersInput, ReservationDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute({ slug, data }: ReserveNumbersInput): Promise<ReservationDto> {
    const raffle = await this.raffles.findBySlug(slug);
    if (!raffle) throw new NotFoundError('Rifa não encontrada.');
    if (raffle.visibility === 'private') throw new BusinessRuleError('Esta rifa está privada e não aceita reservas.');
    assertOpen(raffle, 'Esta rifa já foi encerrada.');

    const numbers = [...new Set(data.numbers.map((n) => assertIntInRange(n, 1, raffle.totalNumbers, 'Número')))]
      .sort((a, b) => a - b);

    return this.unitOfWork.run(async () => {
      if (raffle.maxPerBuyer != null) {
        const already = await this.orders.countActiveNumbersByPhone(raffle.id, data.phone);
        if (already + numbers.length > raffle.maxPerBuyer) {
          throw new BusinessRuleError(
            `Esta rifa permite no máximo ${raffle.maxPerBuyer} número(s) por pessoa` +
              (already ? ` e você já tem ${already}.` : '.'),
          );
        }
      }

      const busy = await this.orders.findTakenAmong(raffle.id, numbers);
      if (busy.length) throw new NumbersUnavailableError(busy);

      const now = Date.now();
      const order = await this.orders.create({
        raffleId: raffle.id,
        token: newOrderToken(),
        buyerName: data.name,
        buyerPhone: data.phone,
        numbers,
        createdAt: now,
        expiresAt: now + raffle.reserveMinutes * 60_000,
      });
      return { token: order.token };
    });
  }
}
