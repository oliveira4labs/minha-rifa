import type { Migration } from '../interfaces/migration.interface.js';

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
