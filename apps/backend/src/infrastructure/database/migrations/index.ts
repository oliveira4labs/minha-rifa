import type { Migration } from '../interfaces/migration.interface.js';
import { initialSchema } from './001-initial-schema.js';

/**
 * Todas as migrações, em ordem. Para mudar o esquema, crie um arquivo novo
 * (002-…) e adicione aqui; nunca edite uma migração já aplicada.
 */
export const MIGRATIONS: Migration[] = [initialSchema];
