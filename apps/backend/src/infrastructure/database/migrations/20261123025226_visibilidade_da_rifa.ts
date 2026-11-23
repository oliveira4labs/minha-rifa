import type { Migration } from '../interfaces/migration.interface.js';

const migration: Migration = {
  up: `
    ALTER TABLE raffles
      ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private'));
    CREATE INDEX idx_photos_filename ON photos (filename);
  `,
  down: `
    DROP INDEX idx_photos_filename;
    ALTER TABLE raffles DROP COLUMN visibility;
  `,
};

export default migration;
