import type { Migration } from '../interfaces/migration.interface.js';

const migration: Migration = {
  up: `
    ALTER TABLE orders
      ALTER COLUMN buyer_name DROP NOT NULL,
      ALTER COLUMN buyer_phone DROP NOT NULL,
      ADD COLUMN proof_sent_at BIGINT;

    ALTER TABLE orders DROP CONSTRAINT orders_status_check;
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('held', 'pending', 'proof_sent', 'paid', 'expired', 'cancelled'));
    ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'held';
    ALTER TABLE orders ADD CONSTRAINT orders_buyer_required
      CHECK (status IN ('held', 'expired', 'cancelled') OR (buyer_name IS NOT NULL AND buyer_phone IS NOT NULL));

    DROP INDEX idx_orders_pending_expiry;
    CREATE INDEX idx_orders_awaiting_buyer_expiry ON orders (expires_at) WHERE status IN ('held', 'pending');

    UPDATE orders SET status = 'proof_sent', proof_sent_at = created_at WHERE status = 'pending';
  `,
  down: `
    DELETE FROM orders WHERE buyer_name IS NULL OR buyer_phone IS NULL;
    UPDATE orders SET status = 'pending' WHERE status = 'proof_sent';

    DROP INDEX idx_orders_awaiting_buyer_expiry;
    CREATE INDEX idx_orders_pending_expiry ON orders (expires_at) WHERE status = 'pending';

    ALTER TABLE orders DROP CONSTRAINT orders_buyer_required;
    ALTER TABLE orders DROP CONSTRAINT orders_status_check;
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'paid', 'expired', 'cancelled'));
    ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

    ALTER TABLE orders
      DROP COLUMN proof_sent_at,
      ALTER COLUMN buyer_name SET NOT NULL,
      ALTER COLUMN buyer_phone SET NOT NULL;
  `,
};

export default migration;
