#!/usr/bin/env node
/**
 * Cria um arquivo de migração vazio:
 *   npm run migration:create -- adiciona cpf no comprador
 *   → src/infrastructure/database/migrations/20261118143000_adiciona_cpf_no_comprador.ts
 *
 * O prefixo é a data/hora (UTC), então migrações criadas por pessoas diferentes não colidem
 * e ficam na ordem em que foram escritas.
 */
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'infrastructure', 'database', 'migrations',
);

const name = process.argv.slice(2).join(' ')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

if (!name) {
  console.error('Informe um nome. Ex.: npm run migration:create -- adiciona cpf no comprador');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
const file = path.join(MIGRATIONS_DIR, `${stamp}_${name}.ts`);
if (existsSync(file)) {
  console.error(`Já existe: ${file}`);
  process.exit(1);
}

writeFileSync(file, `import type { Migration } from '../interfaces/migration.interface.js';

/** TODO: descreva a mudança. */
const migration: Migration = {
  up: \`
    -- ALTER TABLE orders ADD COLUMN buyer_cpf TEXT;
  \`,
  down: \`
    -- ALTER TABLE orders DROP COLUMN buyer_cpf;
  \`,
};

export default migration;
`);

console.log(`Criada: ${path.relative(process.cwd(), file)}`);
console.log('Escreva o SQL de "up" e de "down" e rode: npm run migration:run');
