import type {
  NewHeldOrder, Order, ReleaseStatus, TakenNumber,
} from '../../interfaces/order.interface.js';
import type { NumberCounts } from '../../interfaces/raffle.interface.js';

export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByToken(token: string): Promise<Order | null>;
  listManageableByRaffle(raffleId: number): Promise<Order[]>;
  listUnpaidIds(raffleId: number): Promise<number[]>;
  listExpiredIds(now: number): Promise<number[]>;
  listTakenNumbers(raffleId: number): Promise<TakenNumber[]>;
  countNumbers(raffleId: number): Promise<NumberCounts>;
  countActiveNumbersByPhone(raffleId: number, phone: string): Promise<number>;
  findTakenAmong(raffleId: number, numbers: number[]): Promise<number[]>;
  createHeld(order: NewHeldOrder): Promise<Order>;
  addNumber(order: Order, number: number): Promise<Order>;
  removeNumber(order: Order, number: number): Promise<Order>;
  confirmBuyer(id: number, name: string, phone: string): Promise<void>;
  markProofSent(id: number, sentAt: number): Promise<void>;
  markPaid(id: number, paidAt: number): Promise<void>;
  release(id: number, status: ReleaseStatus): Promise<void>;
}
