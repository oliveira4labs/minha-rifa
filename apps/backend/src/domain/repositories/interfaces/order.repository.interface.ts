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
  /** `pending` dentro do prazo → `proof_sent`. Retorna `false` se o pedido já não estava nesse estado. */
  markProofSent(id: number, sentAt: number): Promise<boolean>;
  /** `pending`/`proof_sent` → `paid`. Retorna `false` se o pedido já não estava nesse estado. */
  markPaid(id: number, paidAt: number): Promise<boolean>;
  release(id: number, status: ReleaseStatus): Promise<void>;
}
