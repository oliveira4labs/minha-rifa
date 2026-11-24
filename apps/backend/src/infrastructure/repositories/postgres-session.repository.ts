import { Injectable } from '@nestjs/common';
import type { User } from '../../domain/interfaces/user.interface.js';
import { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { TokenRow } from '../database/interfaces/session-row.interface.js';
import type { UserRow } from '../database/interfaces/user-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';
import { toUser } from './user.mapper.js';

@Injectable()
export class PostgresSessionRepository extends SessionRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  async create(token: string, userId: number, createdAt: number): Promise<void> {
    await this.db.query(
      'INSERT INTO sessions (token, user_id, created_at, last_seen_at) VALUES ($1, $2, $3, $3)',
      [token, userId, createdAt],
    );
  }

  async findUserByToken(token: string, activeSince: number): Promise<User | null> {
    const row = await this.db.one<UserRow>(
      'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.last_seen_at > $2',
      [token, activeSince],
    );
    return row ? toUser(row) : null;
  }

  async touch(token: string, now: number, staleBefore: number): Promise<void> {
    await this.db.query('UPDATE sessions SET last_seen_at = $2 WHERE token = $1 AND last_seen_at < $3', [token, now, staleBefore]);
  }

  async delete(token: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  async deleteIdleSince(cutoff: number): Promise<number> {
    const rows = await this.db.query<TokenRow>('DELETE FROM sessions WHERE last_seen_at <= $1 RETURNING token', [cutoff]);
    return rows.length;
  }
}
