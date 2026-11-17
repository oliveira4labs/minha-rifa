/** Migração de esquema. `id` define a ordem e é gravado em `schema_migrations`. */
export interface Migration {
  id: string;
  up: string;
}

/** Linha de `schema_migrations`. */
export interface AppliedMigrationRow {
  id: string;
}
