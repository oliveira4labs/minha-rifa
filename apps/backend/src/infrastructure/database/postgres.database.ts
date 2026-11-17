import { AsyncLocalStorage } from 'node:async_hooks';
import {
  Injectable, Logger, type OnModuleDestroy, type OnModuleInit,
} from '@nestjs/common';
import pg from 'pg';
import { appConfig } from '../../config/app.config.js';
import type { AppliedMigrationRow } from './interfaces/migration.interface.js';
import { MIGRATIONS } from './migrations/index.js';

// BIGINT (ids, datas em ms, COUNT) volta como string por padrão; aqui vira number.
// Seguro: nossos valores ficam muito abaixo de Number.MAX_SAFE_INTEGER.
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => Number(value));

const SERIALIZATION_FAILURE = '40001';
const DEADLOCK_DETECTED = '40P01';
const MAX_TRANSACTION_ATTEMPTS = 5;
const MIGRATION_LOCK_KEY = 728_391;

const isRetryable = (err: unknown) =>
  err instanceof Error && [SERIALIZATION_FAILURE, DEADLOCK_DETECTED].includes((err as pg.DatabaseError).code ?? '');

/**
 * Pool de conexões com o Postgres.
 * - `query`/`one`: usam a conexão da transação em andamento, se houver (AsyncLocalStorage).
 * - `transaction`: SERIALIZABLE com nova tentativa automática em conflito de concorrência.
 * - Aplica as migrações pendentes ao iniciar.
 */
@Injectable()
export class PostgresDatabase implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresDatabase.name);
  private readonly pool = new pg.Pool({ connectionString: appConfig.databaseUrl });
  private readonly currentTransaction = new AsyncLocalStorage<pg.PoolClient>();

  async onModuleInit(): Promise<void> {
    await this.migrate();
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

  /** Reentrante: dentro de uma transação, só executa `work` nela. */
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

  /**
   * Executa `work` num SAVEPOINT da transação atual: se falhar, desfaz só essa parte
   * e a transação continua utilizável (ex.: tratar violação de chave e consultar de novo).
   */
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

  private async migrate(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Trava global: se várias instâncias subirem juntas, só uma migra.
      await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
      await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
      const applied = new Set((await client.query<AppliedMigrationRow>('SELECT id FROM schema_migrations')).rows.map((r) => r.id));
      for (const migration of MIGRATIONS) {
        if (applied.has(migration.id)) continue;
        await client.query('BEGIN');
        try {
          await client.query(migration.up);
          await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
          await client.query('COMMIT');
          this.logger.log(`Migração aplicada: ${migration.id}`);
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      }
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]).catch(() => {});
      client.release();
    }
  }
}
