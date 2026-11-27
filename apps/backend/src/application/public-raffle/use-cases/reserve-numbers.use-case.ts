import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../domain/errors/domain.errors.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { ReservationDto, ReserveNumbersInput } from '../dto/public-raffle.dto.js';
import { EXPIRED_CART_MESSAGE, findActiveCart, requireReservableRaffle } from '../public-raffle.helpers.js';
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
    const raffle = await requireReservableRaffle(this.raffles, slug);

    return this.unitOfWork.run(async () => {
      const cart = await findActiveCart(this.orders, raffle, data.token);
      if (!cart || !cart.numbers.length) throw new BusinessRuleError(EXPIRED_CART_MESSAGE);

      if (raffle.maxPerBuyer != null) {
        const already = await this.orders.countActiveNumbersByPhone(raffle.id, data.phone);
        if (already + cart.numbers.length > raffle.maxPerBuyer) {
          throw new BusinessRuleError(
            `Esta rifa permite no máximo ${raffle.maxPerBuyer} ${raffle.maxPerBuyer === 1 ? 'número' : 'números'} por pessoa` +
              (already ? ` e você já tem ${already}.` : '.'),
          );
        }
      }

      await this.orders.confirmBuyer(cart.id, data.name, data.phone);
      return { token: cart.token };
    });
  }
}
