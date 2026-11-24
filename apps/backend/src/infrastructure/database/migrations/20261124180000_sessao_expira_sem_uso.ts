import type { Migration } from '../interfaces/migration.interface.js';

// Encerra todas as sessões abertas (inclusive as do login antigo por senha):
// todo mundo entra de novo uma vez, já pelo Google e com a nova expiração.
const migration: Migration = {
  up: `
    DELETE FROM sessions;
    ALTER TABLE sessions ADD COLUMN last_seen_at BIGINT NOT NULL;
    CREATE INDEX sessions_last_seen_at_idx ON sessions (last_seen_at);
  `,
  down: `
    DROP INDEX sessions_last_seen_at_idx;
    ALTER TABLE sessions DROP COLUMN last_seen_at;
  `,
};

export default migration;
