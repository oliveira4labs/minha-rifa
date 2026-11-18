import { Injectable } from '@nestjs/common';
import type { DatabaseError } from 'pg';
import type { NewOrder, Order, TakenNumber } from '../../domain/interfaces/order.interface.js';
import type { NumberCounts } from '../../domain/interfaces/raffle.interface.js';
import { NumbersUnavailableError } from '../../domain/errors/domain.errors.js';
import { OrderRepository } from '../../domain/repositories/order.repository.js';
import type {
  CountRow, IdRow, NumberCountsRow, NumberRow, OrderRow, TakenNumberRow,
} from '../database/interfaces/order-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';

const UNIQUE_VIOLATION = '23505';

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  raffleId: r.raffle_id,
  token: r.token,
  buyerName: r.buyer_name,
  buyerPhone: r.buyer_phone,
  numbers: r.numbers,
  status: r.status,
  createdAt: r.created_at,
  expiresAt: r.expires_at,
  paidAt: r.paid_at,
});

const isTicketConflict = (err: unknown) =>
  (err as DatabaseError)?.code === UNIQUE_VIOLATION && (err as DatabaseError).table === 'tickets';

@Injectable()
export class PostgresOrderRepository extends OrderRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  async findById(id: number): Promise<Order | null> {
    if (!Number.isSafeInteger(id)) return null;
    const row = await this.db.one<OrderRow>('SELECT * FROM orders WHERE id = $1', [id]);
    return row ? toOrder(row) : null;
  }

  async findByToken(token: string): Promise<Order | null> {
    const row = await this.db.one<OrderRow>('SELECT * FROM orders WHERE token = $1', [token]);
    return row ? toOrder(row) : null;
  }

  async listActiveByRaffle(raffleId: number): Promise<Order[]> {
    const rows = await this.db.query<OrderRow>(
      `SELECT * FROM orders WHERE raffle_id = $1 AND status IN ('pending', 'paid')
       ORDER BY status = 'pending' DESC, created_at DESC, id DESC`,
      [raffleId],
    );
    return rows.map(toOrder);
  }

  async listPendingIds(raffleId: number): Promise<number[]> {
    const rows = await this.db.query<IdRow>(`SELECT id FROM orders WHERE raffle_id = $1 AND status = 'pending'`, [raffleId]);
    return rows.map((r) => r.id);
  }

  async listExpiredPendingIds(now: number): Promise<number[]> {
    const rows = await this.db.query<IdRow>(`SELECT id FROM orders WHERE status = 'pending' AND expires_at <= $1`, [now]);
    return rows.map((r) => r.id);
  }

  async listTakenNumbers(raffleId: number): Promise<TakenNumber[]> {
    const rows = await this.db.query<TakenNumberRow>(
      `SELECT t.number, o.status, o.buyer_name, o.buyer_phone
       FROM tickets t JOIN orders o ON o.id = t.order_id WHERE t.raffle_id = $1 ORDER BY t.number`,
      [raffleId],
    );
    return rows.map((r) => ({ number: r.number, status: r.status, buyerName: r.buyer_name, buyerPhone: r.buyer_phone }));
  }

  async countNumbers(raffleId: number): Promise<NumberCounts> {
    const row = await this.db.one<NumberCountsRow>(
      `SELECT COUNT(*) FILTER (WHERE o.status = 'paid') AS paid, COUNT(*) FILTER (WHERE o.status = 'pending') AS pending
       FROM tickets t JOIN orders o ON o.id = t.order_id WHERE t.raffle_id = $1`,
      [raffleId],
    );
    return { paid: row!.paid, pending: row!.pending };
  }

  async countActiveNumbersByPhone(raffleId: number, phone: string): Promise<number> {
    const row = await this.db.one<CountRow>(
      `SELECT COUNT(*) AS n FROM tickets t JOIN orders o ON o.id = t.order_id
       WHERE t.raffle_id = $1 AND o.buyer_phone = $2`,
      [raffleId, phone],
    );
    return row!.n;
  }

  async findTakenAmong(raffleId: number, numbers: number[]): Promise<number[]> {
    const rows = await this.db.query<NumberRow>(
      'SELECT number FROM tickets WHERE raffle_id = $1 AND number = ANY($2::int[]) ORDER BY number',
      [raffleId, numbers],
    );
    return rows.map((r) => r.number);
  }

  async create(order: NewOrder): Promise<Order> {
    return this.db.transaction(async () => {
      const row = await this.db.one<IdRow>(
        `INSERT INTO orders (raffle_id, token, buyer_name, buyer_phone, numbers, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [order.raffleId, order.token, order.buyerName, order.buyerPhone, JSON.stringify(order.numbers),
          order.createdAt, order.expiresAt],
      );
      const id = row!.id;
      try {
        await this.db.savepoint('reserve_tickets', () => this.db.query(
          'INSERT INTO tickets (raffle_id, number, order_id) SELECT $1, n, $3 FROM unnest($2::int[]) AS n',
          [order.raffleId, order.numbers, id],
        ));
      } catch (err) {
        if (isTicketConflict(err)) throw new NumbersUnavailableError(await this.findTakenAmong(order.raffleId, order.numbers));
        throw err;
      }
      return { ...order, id, status: 'pending', paidAt: null };
    });
  }

  async markPaid(id: number, paidAt: number): Promise<void> {
    await this.db.query(`UPDATE orders SET status = 'paid', paid_at = $1 WHERE id = $2`, [paidAt, id]);
  }

  async release(id: number, status: 'cancelled' | 'expired'): Promise<void> {
    await this.db.transaction(async () => {
      await this.db.query('DELETE FROM tickets WHERE order_id = $1', [id]);
      await this.db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    });
  }
}
