/**
 * Conteúdo de um arquivo em `migrations/` (export default).
 * `up` aplica a mudança; `down` desfaz exatamente o que `up` fez.
 */
export interface Migration {
  up: string;
  down: string;
}

/** Migração carregada do disco. `id` = nome do arquivo sem extensão (define a ordem). */
export interface LoadedMigration extends Migration {
  id: string;
}

/** Linha de `schema_migrations`. */
export interface AppliedMigrationRow {
  id: string;
  applied_at: Date;
}

/** Situação de cada migração, para o comando `status`. */
export interface MigrationStatus {
  id: string;
  appliedAt: Date | null;
  /** Aplicada no banco, mas o arquivo não existe mais. */
  missingFile: boolean;
}

/** Destino das mensagens do migrador (console na CLI, Logger do Nest na aplicação). */
export type MigrationLogger = (message: string) => void;
