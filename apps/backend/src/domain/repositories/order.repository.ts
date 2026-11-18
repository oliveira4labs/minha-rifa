import type { NewOrder, Order, TakenNumber } from '../interfaces/order.interface.js';
import type { NumberCounts } from '../interfaces/raffle.interface.js';
import type { IOrderRepository } from './interfaces/order.repository.interface.js';

export abstract class OrderRepository implements IOrderRepository {
  abstract findById(id: number): Promise<Order | null>;
  abstract findByToken(token: string): Promise<Order | null>;
  abstract listActiveByRaffle(raffleId: number): Promise<Order[]>;
  abstract listPendingIds(raffleId: number): Promise<number[]>;
  abstract listExpiredPendingIds(now: number): Promise<number[]>;
  abstract listTakenNumbers(raffleId: number): Promise<TakenNumber[]>;
  abstract countNumbers(raffleId: number): Promise<NumberCounts>;
  abstract countActiveNumbersByPhone(raffleId: number, phone: string): Promise<number>;
  abstract findTakenAmong(raffleId: number, numbers: number[]): Promise<number[]>;
  abstract create(order: NewOrder): Promise<Order>;
  abstract markPaid(id: number, paidAt: number): Promise<void>;
  abstract release(id: number, status: 'cancelled' | 'expired'): Promise<void>;
}
