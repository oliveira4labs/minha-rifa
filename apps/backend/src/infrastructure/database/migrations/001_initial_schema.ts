import type { Migration } from '../interfaces/migration.interface.js';

/** Esquema inicial. Datas em milissegundos (BIGINT), valores em centavos. */
const migration: Migration = {
  up: `
    CREATE TABLE users (
      id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name        TEXT   NOT NULL,
      email       TEXT   NOT NULL UNIQUE,
      pass_hash   TEXT   NOT NULL,
      salt        TEXT   NOT NULL,
      created_at  BIGINT NOT NULL
    );

    CREATE TABLE sessions (
      token       TEXT   PRIMARY KEY,
      user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  BIGINT NOT NULL
    );

    CREATE TABLE raffles (
      id              BIGINT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      slug            TEXT    NOT NULL UNIQUE,
      user_id         BIGINT  NOT NULL REFERENCES users(id),
      title           TEXT    NOT NULL,
      description     TEXT    NOT NULL DEFAULT '',
      total_numbers   INTEGER NOT NULL,
      price_cents     INTEGER NOT NULL,
      pix_key         TEXT    NOT NULL,
      whatsapp        TEXT    NOT NULL,
      reserve_minutes INTEGER NOT NULL,
      max_per_buyer   INTEGER,
      draw_date       BIGINT,
      status          TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'drawn')),
      winner_number   INTEGER,
      drawn_at        BIGINT,
      created_at      BIGINT  NOT NULL
    );
    CREATE INDEX idx_raffles_owner ON raffles (user_id, created_at DESC);

    CREATE TABLE photos (
      id          BIGINT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      raffle_id   BIGINT  NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
      filename    TEXT    NOT NULL,
      position    INTEGER NOT NULL
    );
    CREATE INDEX idx_photos_raffle ON photos (raffle_id, position);

    CREATE TABLE orders (
      id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      raffle_id    BIGINT NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
      token        TEXT   NOT NULL UNIQUE,
      buyer_name   TEXT   NOT NULL,
      buyer_phone  TEXT   NOT NULL,
      numbers      JSONB  NOT NULL,
      status       TEXT   NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
      created_at   BIGINT NOT NULL,
      expires_at   BIGINT NOT NULL,
      paid_at      BIGINT
    );
    CREATE INDEX idx_orders_raffle ON orders (raffle_id, status);
    CREATE INDEX idx_orders_pending_expiry ON orders (expires_at) WHERE status = 'pending';

    -- Um número só pode pertencer a um pedido ativo (pendente ou pago) por vez.
    CREATE TABLE tickets (
      raffle_id  BIGINT  NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
      number     INTEGER NOT NULL,
      order_id   BIGINT  NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      PRIMARY KEY (raffle_id, number)
    );
    CREATE INDEX idx_tickets_order ON tickets (order_id);
  `,
  down: `
    DROP TABLE tickets;
    DROP TABLE orders;
    DROP TABLE photos;
    DROP TABLE raffles;
    DROP TABLE sessions;
    DROP TABLE users;
  `,
};

export default migration;
