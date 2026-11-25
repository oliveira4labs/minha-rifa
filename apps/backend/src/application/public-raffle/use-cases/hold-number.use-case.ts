import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../domain/errors/domain.errors.js';
import { newOrderToken } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { CartDto, HoldNumberInput } from '../dto/public-raffle.dto.js';
import {
  assertRaffleNumber, findActiveCart, requireReservableRaffle, toCartDto,
} from '../public-raffle.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class HoldNumberUseCase implements UseCase<HoldNumberInput, CartDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute({ slug, data }: HoldNumberInput): Promise<CartDto> {
    const raffle = await requireReservableRaffle(this.raffles, slug);
    const number = assertRaffleNumber(raffle, data.number);

    return this.unitOfWork.run(async () => {
      const now = Date.now();
      const cart = await findActiveCart(this.orders, raffle, data.token, now);
      if (cart?.numbers.includes(number)) return toCartDto(cart);

      if (raffle.maxPerBuyer != null && (cart?.numbers.length ?? 0) >= raffle.maxPerBuyer) {
        throw new BusinessRuleError(`Limite de ${raffle.maxPerBuyer} número(s) por pessoa nesta rifa.`);
      }

      if (cart) return toCartDto(await this.orders.addNumber(cart, number));

      const created = await this.orders.createHeld({
        raffleId: raffle.id,
        token: newOrderToken(),
        numbers: [number],
        createdAt: now,
        expiresAt: now + raffle.reserveMinutes * 60_000,
      });
      return toCartDto(created);
    });
  }
}
