import type { Migration } from '../interfaces/migration.interface.js';

const migration: Migration = {
  up: `
    CREATE TABLE remote_config (
      key          TEXT        PRIMARY KEY,
      value        TEXT        NOT NULL,
      is_public    BOOLEAN     NOT NULL DEFAULT true,
      description  TEXT        NOT NULL DEFAULT '',
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    INSERT INTO remote_config (key, value, description)
    VALUES ('createUser', 'enabled', 'enabled | disabled: mostra ou esconde a aba de criar conta');
  `,
  down: `
    DROP TABLE remote_config;
  `,
};

export default migration;
