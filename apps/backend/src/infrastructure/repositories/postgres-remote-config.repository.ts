import { Injectable } from '@nestjs/common';
import type { RemoteConfigEntry } from '../../domain/interfaces/remote-config.interface.js';
import { RemoteConfigRepository } from '../../domain/repositories/remote-config.repository.js';
import type { RemoteConfigRow } from '../database/interfaces/remote-config-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';

@Injectable()
export class PostgresRemoteConfigRepository extends RemoteConfigRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  async listPublic(): Promise<RemoteConfigEntry[]> {
    return this.db.query<RemoteConfigRow>('SELECT key, value FROM remote_config WHERE is_public ORDER BY key');
  }
}
