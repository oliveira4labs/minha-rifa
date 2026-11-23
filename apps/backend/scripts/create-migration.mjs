#!/usr/bin/env node
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

const migration: Migration = {
  up: \`
  \`,
  down: \`
  \`,
};

export default migration;
`);

console.log(`Criada: ${path.relative(process.cwd(), file)}`);
console.log('Escreva o SQL de "up" e de "down" e rode: npm run migration:run');
