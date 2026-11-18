import type { NewOrder, Order, TakenNumber } from '../../interfaces/order.interface.js';
import type { NumberCounts } from '../../interfaces/raffle.interface.js';

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByToken(token: string): Promise<Order | null>;
  listActiveByRaffle(raffleId: number): Promise<Order[]>;
  listPendingIds(raffleId: number): Promise<number[]>;
  listExpiredPendingIds(now: number): Promise<number[]>;
  listTakenNumbers(raffleId: number): Promise<TakenNumber[]>;
  countNumbers(raffleId: number): Promise<NumberCounts>;
  countActiveNumbersByPhone(raffleId: number, phone: string): Promise<number>;
  findTakenAmong(raffleId: number, numbers: number[]): Promise<number[]>;
  create(order: NewOrder): Promise<Order>;
  markPaid(id: number, paidAt: number): Promise<void>;
  release(id: number, status: 'cancelled' | 'expired'): Promise<void>;
}
