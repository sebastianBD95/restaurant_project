-- Create subscriptions table to track restaurant subscription status
CREATE TABLE IF NOT EXISTS servu.subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active','past_due','canceled','trialing')) DEFAULT 'canceled',
    plan_amount_cop INT NOT NULL DEFAULT 60,
    current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(restaurant_id)
);

-- Trigger to auto-update updated_at on update
CREATE OR REPLACE FUNCTION update_subscriptions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_subscriptions_timestamp ON servu.subscriptions;
CREATE TRIGGER trg_update_subscriptions_timestamp
    BEFORE UPDATE ON servu.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscriptions_timestamp();

-- Helpful index for status and period checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON servu.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON servu.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON servu.subscriptions(current_period_end);

