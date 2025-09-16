-- Drop restaurant_id from subscriptions (now user-based)
ALTER TABLE servu.subscriptions
    DROP COLUMN IF EXISTS restaurant_id;

