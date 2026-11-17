import { Injectable } from '@nestjs/common';
import type { User } from '../../domain/interfaces/user.interface.js';
import { SessionRepository } from '../../domain/repositories/session.repository.js';
import type { UserRow } from '../database/interfaces/user-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';
import { toUser } from './user.mapper.js';

@Injectable()
export class PostgresSessionRepository extends SessionRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  async create(token: string, userId: number, createdAt: number): Promise<void> {
    await this.db.query('INSERT INTO sessions (token, user_id, created_at) VALUES ($1, $2, $3)', [token, userId, createdAt]);
  }

  async findUserByToken(token: string): Promise<User | null> {
    const row = await this.db.one<UserRow>(
      'SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1',
      [token],
    );
    return row ? toUser(row) : null;
  }

  async delete(token: string): Promise<void> {
    await this.db.query('DELETE FROM sessions WHERE token = $1', [token]);
  }
}
