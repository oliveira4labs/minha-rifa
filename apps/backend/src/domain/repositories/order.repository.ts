import type {
  NewHeldOrder, Order, ReleaseStatus, TakenNumber,
} from '../interfaces/order.interface.js';
import type { NumberCounts } from '../interfaces/raffle.interface.js';
import type { IOrderRepository } from './interfaces/order.repository.interface.js';

export abstract class OrderRepository implements IOrderRepository {
  abstract findById(id: number): Promise<Order | null>;
  abstract findByToken(token: string): Promise<Order | null>;
  abstract listManageableByRaffle(raffleId: number): Promise<Order[]>;
  abstract listUnpaidIds(raffleId: number): Promise<number[]>;
  abstract listExpiredIds(now: number): Promise<number[]>;
  abstract listTakenNumbers(raffleId: number): Promise<TakenNumber[]>;
  abstract countNumbers(raffleId: number): Promise<NumberCounts>;
  abstract countActiveNumbersByPhone(raffleId: number, phone: string): Promise<number>;
  abstract findTakenAmong(raffleId: number, numbers: number[]): Promise<number[]>;
  abstract createHeld(order: NewHeldOrder): Promise<Order>;
  abstract addNumber(order: Order, number: number): Promise<Order>;
  abstract removeNumber(order: Order, number: number): Promise<Order>;
  abstract confirmBuyer(id: number, name: string, phone: string): Promise<void>;
  abstract markProofSent(id: number, sentAt: number): Promise<boolean>;
  abstract markPaid(id: number, paidAt: number): Promise<boolean>;
  abstract release(id: number, status: ReleaseStatus): Promise<void>;
}
