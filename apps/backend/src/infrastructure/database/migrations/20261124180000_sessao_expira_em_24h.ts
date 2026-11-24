import type { Migration } from '../interfaces/migration.interface.js';

// Encerra todas as sessões abertas (inclusive as do login antigo por senha):
// todo mundo entra de novo, já pelo Google e com a sessão de 24h.
const migration: Migration = {
  up: `
    DELETE FROM sessions;
    CREATE INDEX sessions_created_at_idx ON sessions (created_at);
  `,
  down: `
    DROP INDEX sessions_created_at_idx;
  `,
};

export default migration;
