-- Switch subscriptions association to user-based
ALTER TABLE servu.subscriptions
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES servu.users(user_id) ON DELETE CASCADE;

-- Backfill user_id using restaurant owner
UPDATE servu.subscriptions s
SET user_id = r.owner_id
FROM servu.restaurants r
WHERE s.restaurant_id = r.restaurant_id AND s.user_id IS NULL;

-- Ensure unique per user
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE schemaname = 'servu' AND indexname = 'idx_subscriptions_user_id'
    ) THEN
        CREATE INDEX idx_subscriptions_user_id ON servu.subscriptions(user_id);
    END IF;
END $$;

-- Add unique constraint on user_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM   pg_constraint
        WHERE  conname = 'subscriptions_user_id_key'
    ) THEN
        ALTER TABLE servu.subscriptions ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
    END IF;
END $$;

