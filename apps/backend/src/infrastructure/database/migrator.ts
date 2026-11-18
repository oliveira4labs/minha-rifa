import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';
import type {
  AppliedMigrationRow, LoadedMigration, Migration, MigrationLogger, MigrationStatus,
} from './interfaces/migration.interface.js';

const MIGRATIONS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
/** `001_initial_schema.js`, `20261118143000_add_cpf.js`... (compilados; .d.ts e .map ficam de fora) */
const MIGRATION_FILE = /^(\d+_[a-z0-9_]+)\.js$/;
/** Trava global: se várias instâncias/CLIs rodarem juntas, só uma mexe no esquema por vez. */
const MIGRATION_LOCK_KEY = 728_391;

const isBlankSql = (sql: string) => sql.replace(/--.*$/gm, '').trim() === '';

/**
 * Aplica e desfaz as migrações de `migrations/`, registrando em `schema_migrations`.
 * Cada migração roda na sua própria transação: ou entra inteira, ou não entra.
 */
export class Migrator {
  constructor(
    private readonly connectionString: string,
    private readonly log: MigrationLogger = console.log,
  ) {}

  /** Aplica todas as pendentes, em ordem. Retorna os ids aplicados. */
  async up(): Promise<string[]> {
    const migrations = await this.load();
    return this.withLock(async (client) => {
      const applied = await this.appliedIds(client);
      const pending = migrations.filter((m) => !applied.has(m.id));
      for (const migration of pending) {
        if (isBlankSql(migration.up)) throw new Error(`A migração ${migration.id} está com o "up" vazio.`);
        await this.inTransaction(client, async () => {
          await client.query(migration.up);
          await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [migration.id]);
        });
        this.log(`Aplicada: ${migration.id}`);
      }
      return pending.map((m) => m.id);
    });
  }

  /** Desfaz as `steps` últimas migrações aplicadas. Retorna os ids desfeitos. */
  async down(steps = 1): Promise<string[]> {
    const migrations = new Map((await this.load()).map((m) => [m.id, m]));
    return this.withLock(async (client) => {
      const toRevert = [...await this.appliedIds(client)].sort().reverse().slice(0, steps);
      for (const id of toRevert) {
        const migration = migrations.get(id);
        if (!migration) throw new Error(`Não dá para reverter ${id}: o arquivo da migração não existe mais.`);
        if (isBlankSql(migration.down)) throw new Error(`A migração ${id} não tem "down": não dá para reverter.`);
        await this.inTransaction(client, async () => {
          await client.query(migration.down);
          await client.query('DELETE FROM schema_migrations WHERE id = $1', [id]);
        });
        this.log(`Revertida: ${id}`);
      }
      return toRevert;
    });
  }

  /** Todas as migrações (do disco e do banco), em ordem, com a data em que foram aplicadas. */
  async status(): Promise<MigrationStatus[]> {
    const files = new Set((await this.load()).map((m) => m.id));
    return this.withLock(async (client) => {
      const rows = (await client.query<AppliedMigrationRow>('SELECT id, applied_at FROM schema_migrations')).rows;
      const appliedAt = new Map(rows.map((r) => [r.id, r.applied_at]));
      return [...new Set([...files, ...appliedAt.keys()])].sort().map((id) => ({
        id,
        appliedAt: appliedAt.get(id) ?? null,
        missingFile: !files.has(id),
      }));
    });
  }

  private async load(): Promise<LoadedMigration[]> {
    const ids = (await readdir(MIGRATIONS_DIR))
      .map((file) => MIGRATION_FILE.exec(file)?.[1])
      .filter((id): id is string => Boolean(id))
      .sort();
    const migrations: LoadedMigration[] = [];
    for (const id of ids) {
      const module = await import(pathToFileURL(path.join(MIGRATIONS_DIR, `${id}.js`)).href);
      const migration = module.default as Migration | undefined;
      if (typeof migration?.up !== 'string' || typeof migration.down !== 'string') {
        throw new Error(`Migração ${id} inválida: o arquivo precisa ter "export default { up, down }".`);
      }
      migrations.push({ id, up: migration.up, down: migration.down });
    }
    return migrations;
  }

  private async appliedIds(client: pg.Client): Promise<Set<string>> {
    const rows = (await client.query<AppliedMigrationRow>('SELECT id FROM schema_migrations')).rows;
    return new Set(rows.map((r) => r.id));
  }

  private async inTransaction(client: pg.Client, work: () => Promise<void>): Promise<void> {
    await client.query('BEGIN');
    try {
      await work();
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  }

  private async withLock<T>(work: (client: pg.Client) => Promise<T>): Promise<T> {
    const client = new pg.Client({ connectionString: this.connectionString });
    await client.connect();
    try {
      await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
      await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
      return await work(client);
    } finally {
      await client.end();
    }
  }
}
