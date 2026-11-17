import type { NewOrder, Order, TakenNumber } from '../../interfaces/order.interface.js';
import type { NumberCounts } from '../../interfaces/raffle.interface.js';

/**
 * Pedidos (reservas) e os números que eles ocupam.
 */
export interface IOrderRepository {
  findById(id: number): Promise<Order | null>;
  findByToken(token: string): Promise<Order | null>;
  /** Pedidos ativos: pendentes primeiro, depois os mais recentes. */
  listActiveByRaffle(raffleId: number): Promise<Order[]>;
  listPendingIds(raffleId: number): Promise<number[]>;
  listExpiredPendingIds(now: number): Promise<number[]>;
  /** Números ocupados por pedidos ativos, em ordem crescente. */
  listTakenNumbers(raffleId: number): Promise<TakenNumber[]>;
  countNumbers(raffleId: number): Promise<NumberCounts>;
  countActiveNumbersByPhone(raffleId: number, phone: string): Promise<number>;
  /** Quais dos números informados já estão ocupados. */
  findTakenAmong(raffleId: number, numbers: number[]): Promise<number[]>;
  /** Cria o pedido e ocupa os números. Lança NumbersUnavailableError se algum número tiver sido ocupado no meio tempo. */
  create(order: NewOrder): Promise<Order>;
  markPaid(id: number, paidAt: number): Promise<void>;
  /** Encerra o pedido (cancelado/expirado) e libera os números. */
  release(id: number, status: 'cancelled' | 'expired'): Promise<void>;
}
