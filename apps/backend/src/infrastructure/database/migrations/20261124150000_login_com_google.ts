import type { Migration } from '../interfaces/migration.interface.js';

const migration: Migration = {
  up: `
    ALTER TABLE users ADD COLUMN google_sub TEXT UNIQUE;
    ALTER TABLE users ALTER COLUMN pass_hash DROP NOT NULL;
    ALTER TABLE users ALTER COLUMN salt DROP NOT NULL;

    UPDATE remote_config
       SET description = 'enabled | disabled: login com Google pode criar conta nova (disabled = só quem já tem conta)',
           updated_at = now()
     WHERE key = 'createUser';
  `,
  down: `
    UPDATE remote_config
       SET description = 'enabled | disabled: tela e API de criar conta', updated_at = now()
     WHERE key = 'createUser';

    UPDATE users SET pass_hash = '', salt = '' WHERE pass_hash IS NULL OR salt IS NULL;
    ALTER TABLE users ALTER COLUMN salt SET NOT NULL;
    ALTER TABLE users ALTER COLUMN pass_hash SET NOT NULL;
    ALTER TABLE users DROP COLUMN google_sub;
  `,
};

export default migration;
