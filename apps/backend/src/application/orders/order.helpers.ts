import type { Order } from '../../domain/interfaces/order.interface.js';
import { NotFoundError } from '../../domain/errors/domain.errors.js';
import { assertOpen } from '../../domain/rules/raffle.rules.js';
import type { IOrderRepository } from '../../domain/repositories/interfaces/order.repository.interface.js';
import type { IRaffleRepository } from '../../domain/repositories/interfaces/raffle.repository.interface.js';

/** Pedido de uma rifa do administrador, ainda aberta. */
export async function requireManageableOrder(
  orders: IOrderRepository,
  raffles: IRaffleRepository,
  userId: number,
  orderId: number,
): Promise<Order> {
  const order = await orders.findById(orderId);
  const raffle = order && await raffles.findByIdAndOwner(order.raffleId, userId);
  if (!order || !raffle) throw new NotFoundError('Pedido não encontrado.');
  assertOpen(raffle);
  return order;
}

