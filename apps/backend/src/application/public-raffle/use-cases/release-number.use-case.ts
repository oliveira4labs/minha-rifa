import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { CartDto, ReleaseNumberInput } from '../dto/public-raffle.dto.js';
import {
  assertRaffleNumber, EMPTY_CART, findActiveCart, requireReservableRaffle, toCartDto,
} from '../public-raffle.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class ReleaseNumberUseCase implements UseCase<ReleaseNumberInput, CartDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute({ slug, data }: ReleaseNumberInput): Promise<CartDto> {
    const raffle = await requireReservableRaffle(this.raffles, slug);
    const number = assertRaffleNumber(raffle, data.number);

    return this.unitOfWork.run(async () => {
      const cart = await findActiveCart(this.orders, raffle, data.token);
      if (!cart) return EMPTY_CART;
      if (!cart.numbers.includes(number)) return toCartDto(cart);

      const updated = await this.orders.removeNumber(cart, number);
      if (!updated.numbers.length) await this.orders.release(updated.id, 'cancelled');
      return toCartDto(updated);
    });
  }
}
