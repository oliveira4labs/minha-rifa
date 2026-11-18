import { Injectable } from '@nestjs/common';
import type { NewUser, User } from '../../domain/interfaces/user.interface.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import type { IdRow } from '../database/interfaces/order-row.interface.js';
import type { UserRow } from '../database/interfaces/user-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';
import { toUser } from './user.mapper.js';

@Injectable()
export class PostgresUserRepository extends UserRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.db.one<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
    return row ? toUser(row) : null;
  }

  async create(user: NewUser): Promise<User> {
    const row = await this.db.one<IdRow>(
      'INSERT INTO users (name, email, pass_hash, salt, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user.name, user.email, user.passwordHash, user.salt, user.createdAt],
    );
    return { id: row!.id, ...user };
  }
}
