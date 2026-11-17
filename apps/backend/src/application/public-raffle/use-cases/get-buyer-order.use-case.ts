import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/domain.errors.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { BuyerOrderDto } from '../dto/public-raffle.dto.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

/** Comprador consulta o próprio pedido pelo token guardado no navegador. */
@Injectable()
export class GetBuyerOrderUseCase implements UseCase<string, BuyerOrderDto> {
  constructor(
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
  ) {}

  async execute(token: string): Promise<BuyerOrderDto> {
    const order = await this.orders.findByToken(token);
    const raffle = order && await this.raffles.findById(order.raffleId);
    if (!order || !raffle) throw new NotFoundError('Pedido não encontrado.');
    return {
      token: order.token,
      status: order.status,
      buyer_name: order.buyerName,
      numbers: order.numbers,
      total_cents: order.numbers.length * raffle.priceCents,
      expires_at: order.expiresAt,
    };
  }
}
