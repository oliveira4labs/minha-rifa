import type { Order } from '../../domain/interfaces/order.interface.js';
import type { Raffle } from '../../domain/interfaces/raffle.interface.js';
import { BusinessRuleError, NotFoundError } from '../../domain/errors/domain.errors.js';
import { isAwaitingBuyer } from '../../domain/rules/order.rules.js';
import { assertIntInRange, assertOpen } from '../../domain/rules/raffle.rules.js';
import type { CartDto } from './dto/public-raffle.dto.js';
import type { IOrderRepository } from '../../domain/repositories/interfaces/order.repository.interface.js';
import type { IRaffleRepository } from '../../domain/repositories/interfaces/raffle.repository.interface.js';

export const EMPTY_CART: CartDto = { token: null, numbers: [], expires_at: null };

export const EXPIRED_CART_MESSAGE = 'O tempo para concluir a compra acabou e os números foram liberados. Escolha de novo.';

export async function requireReservableRaffle(raffles: IRaffleRepository, slug: string): Promise<Raffle> {
  const raffle = await raffles.findBySlug(slug);
  if (!raffle) throw new NotFoundError('Rifa não encontrada.');
  if (raffle.visibility === 'private') throw new BusinessRuleError('Esta rifa está privada e não aceita reservas.');
  assertOpen(raffle, 'Esta rifa já foi encerrada.');
  return raffle;
}

export const assertRaffleNumber = (raffle: Raffle, number: number): number =>
  assertIntInRange(number, 1, raffle.totalNumbers, 'Número');

export async function findActiveCart(
  orders: IOrderRepository,
  raffle: Raffle,
  token: string,
  now = Date.now(),
): Promise<Order | null> {
  if (!token) return null;
  const order = await orders.findByToken(token);
  if (!order || order.raffleId !== raffle.id || order.status !== 'held' || !isAwaitingBuyer(order, now)) return null;
  return order;
}

export const toCartDto = (order: Order): CartDto => (order.numbers.length
  ? { token: order.token, numbers: order.numbers, expires_at: order.expiresAt }
  : EMPTY_CART);
