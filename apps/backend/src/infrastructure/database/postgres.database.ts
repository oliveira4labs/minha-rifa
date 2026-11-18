import { AsyncLocalStorage } from 'node:async_hooks';
import {
  Injectable, Logger, type OnModuleDestroy, type OnModuleInit,
} from '@nestjs/common';
import pg from 'pg';
import { appConfig } from '../../config/app.config.js';
import { Migrator } from './migrator.js';

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

const SERIALIZATION_FAILURE = '40001';
const DEADLOCK_DETECTED = '40P01';
const MAX_TRANSACTION_ATTEMPTS = 5;

const isRetryable = (err: unknown) =>
  err instanceof Error && [SERIALIZATION_FAILURE, DEADLOCK_DETECTED].includes((err as pg.DatabaseError).code ?? '');

@Injectable()
export class PostgresDatabase implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresDatabase.name);
  private readonly pool = new pg.Pool({ connectionString: appConfig.databaseUrl });
  private readonly currentTransaction = new AsyncLocalStorage<pg.PoolClient>();

  async onModuleInit(): Promise<void> {
    if (appConfig.migrateOnBoot) {
      await new Migrator(appConfig.databaseUrl, (message) => this.logger.log(message)).up();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async query<Row extends pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<Row[]> {
    const client = this.currentTransaction.getStore() ?? this.pool;
    return (await client.query<Row>(sql, params)).rows;
  }

  async one<Row extends pg.QueryResultRow>(sql: string, params: unknown[] = []): Promise<Row | null> {
    return (await this.query<Row>(sql, params))[0] ?? null;
  }

  async transaction<T>(work: () => Promise<T>): Promise<T> {
    if (this.currentTransaction.getStore()) return work();

    for (let attempt = 1; ; attempt++) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
        const result = await this.currentTransaction.run(client, work);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        if (attempt < MAX_TRANSACTION_ATTEMPTS && isRetryable(err)) continue;
        throw err;
      } finally {
        client.release();
      }
    }
  }

  async savepoint<T>(name: string, work: () => Promise<T>): Promise<T> {
    await this.query(`SAVEPOINT ${name}`);
    try {
      const result = await work();
      await this.query(`RELEASE SAVEPOINT ${name}`);
      return result;
    } catch (err) {
      await this.query(`ROLLBACK TO SAVEPOINT ${name}`);
      throw err;
    }
  }
}
