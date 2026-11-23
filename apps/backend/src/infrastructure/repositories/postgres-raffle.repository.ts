import { Injectable } from '@nestjs/common';
import type { NewRaffle, Raffle, RaffleDetails } from '../../domain/interfaces/raffle.interface.js';
import { RaffleRepository } from '../../domain/repositories/raffle.repository.js';
import type { IdRow } from '../database/interfaces/order-row.interface.js';
import type { RaffleRow } from '../database/interfaces/raffle-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';

const toRaffle = (r: RaffleRow): Raffle => ({
  id: r.id,
  slug: r.slug,
  userId: r.user_id,
  title: r.title,
  description: r.description,
  totalNumbers: r.total_numbers,
  priceCents: r.price_cents,
  pixKey: r.pix_key,
  whatsapp: r.whatsapp,
  reserveMinutes: r.reserve_minutes,
  maxPerBuyer: r.max_per_buyer,
  drawDate: r.draw_date,
  status: r.status,
  visibility: r.visibility,
  winnerNumber: r.winner_number,
  drawnAt: r.drawn_at,
  createdAt: r.created_at,
});

@Injectable()
export class PostgresRaffleRepository extends RaffleRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  private async findOne(where: string, params: unknown[]): Promise<Raffle | null> {
    const row = await this.db.one<RaffleRow>(`SELECT * FROM raffles WHERE ${where}`, params);
    return row ? toRaffle(row) : null;
  }

  findById(id: number): Promise<Raffle | null> {
    return Number.isSafeInteger(id) ? this.findOne('id = $1', [id]) : Promise.resolve(null);
  }

  findByIdAndOwner(id: number, userId: number): Promise<Raffle | null> {
    return Number.isSafeInteger(id) ? this.findOne('id = $1 AND user_id = $2', [id, userId]) : Promise.resolve(null);
  }

  findBySlug(slug: string): Promise<Raffle | null> {
    return this.findOne('slug = $1', [slug]);
  }

  async listByOwner(userId: number): Promise<Raffle[]> {
    const rows = await this.db.query<RaffleRow>('SELECT * FROM raffles WHERE user_id = $1 ORDER BY created_at DESC, id DESC', [userId]);
    return rows.map(toRaffle);
  }

  async create(r: NewRaffle): Promise<number> {
    const row = await this.db.one<IdRow>(
      `INSERT INTO raffles (slug, user_id, title, description, total_numbers, price_cents, pix_key, whatsapp,
         reserve_minutes, max_per_buyer, draw_date, visibility, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      [r.slug, r.userId, r.title, r.description, r.totalNumbers, r.priceCents, r.pixKey, r.whatsapp,
        r.reserveMinutes, r.maxPerBuyer, r.drawDate, r.visibility, r.createdAt],
    );
    return row!.id;
  }

  async update(id: number, d: RaffleDetails): Promise<void> {
    await this.db.query(
      `UPDATE raffles SET title = $1, description = $2, pix_key = $3, whatsapp = $4, reserve_minutes = $5,
         max_per_buyer = $6, draw_date = $7, total_numbers = $8, price_cents = $9, visibility = $10 WHERE id = $11`,
      [d.title, d.description, d.pixKey, d.whatsapp, d.reserveMinutes, d.maxPerBuyer, d.drawDate,
        d.totalNumbers, d.priceCents, d.visibility, id],
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.query('DELETE FROM raffles WHERE id = $1', [id]);
  }

  async markDrawn(id: number, winnerNumber: number, drawnAt: number): Promise<void> {
    await this.db.query(`UPDATE raffles SET status = 'drawn', winner_number = $1, drawn_at = $2 WHERE id = $3`, [winnerNumber, drawnAt, id]);
  }
}
