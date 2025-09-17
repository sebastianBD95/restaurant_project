-- Create subscriptions table (user-based) and free-tier triggers in one migration
CREATE TABLE IF NOT EXISTS servu.subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES servu.users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active','past_due','canceled','trialing')) DEFAULT 'canceled',
    plan_amount_cop INT NOT NULL DEFAULT 60,
    current_period_start TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
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
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON servu.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON servu.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON servu.subscriptions(user_id);

-- Helper: free tier detection
CREATE OR REPLACE FUNCTION servu.is_free_tier(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM servu.subscriptions s
        WHERE s.user_id = p_user_id
          AND s.status = 'active'
          AND s.current_period_end > CURRENT_TIMESTAMP
    ) INTO v_active;
    RETURN NOT COALESCE(v_active, FALSE);
END;
$$;

-- Free-tier triggers (restaurants, menu_items, raw_ingredients, users(waiters), orders, cash_closings)
-- Restaurants: max 1 per owner
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_restaurants()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_cnt BIGINT; BEGIN
    IF servu.is_free_tier(NEW.owner_id) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.restaurants r WHERE r.owner_id = NEW.owner_id;
        IF v_cnt >= 1 THEN RAISE EXCEPTION 'Free tier limit: only 1 restaurant allowed' USING ERRCODE='P0001'; END IF;
    END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_enforce_free_tier_restaurants ON servu.restaurants;
CREATE TRIGGER trg_enforce_free_tier_restaurants BEFORE INSERT ON servu.restaurants FOR EACH ROW EXECUTE FUNCTION servu.enforce_free_tier_restaurants();

-- Menu items: max 5 per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_menu_items()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_owner UUID; v_cnt BIGINT; BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN RETURN NEW; END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.menu_items m WHERE m.restaurant_id = NEW.restaurant_id;
        IF v_cnt >= 5 THEN RAISE EXCEPTION 'Free tier limit: only 5 menu items allowed' USING ERRCODE='P0001'; END IF;
    END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_enforce_free_tier_menu_items ON servu.menu_items;
CREATE TRIGGER trg_enforce_free_tier_menu_items BEFORE INSERT ON servu.menu_items FOR EACH ROW EXECUTE FUNCTION servu.enforce_free_tier_menu_items();

-- Raw ingredients: max 25 per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_raw_ingredients()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_owner UUID; v_cnt BIGINT; BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN RETURN NEW; END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.raw_ingredients ri WHERE ri.restaurant_id = NEW.restaurant_id;
        IF v_cnt >= 25 THEN RAISE EXCEPTION 'Free tier limit: only 25 ingredients allowed' USING ERRCODE='P0001'; END IF;
    END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_enforce_free_tier_raw_ingredients ON servu.raw_ingredients;
CREATE TRIGGER trg_enforce_free_tier_raw_ingredients BEFORE INSERT ON servu.raw_ingredients FOR EACH ROW EXECUTE FUNCTION servu.enforce_free_tier_raw_ingredients();

-- Waiter users: max 3 per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_waiters()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_owner UUID; v_cnt BIGINT; BEGIN
    IF NEW.role = 'waiter' AND NEW.restaurant_id IS NOT NULL THEN
        SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
        IF v_owner IS NULL THEN RETURN NEW; END IF;
        IF servu.is_free_tier(v_owner) THEN
            SELECT COUNT(*) INTO v_cnt FROM servu.users u WHERE u.restaurant_id = NEW.restaurant_id AND u.role = 'waiter';
            IF v_cnt >= 3 THEN RAISE EXCEPTION 'Free tier limit: only 3 waiter users allowed' USING ERRCODE='P0001'; END IF;
        END IF;
    END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_enforce_free_tier_waiters ON servu.users;
CREATE TRIGGER trg_enforce_free_tier_waiters BEFORE INSERT ON servu.users FOR EACH ROW EXECUTE FUNCTION servu.enforce_free_tier_waiters();

-- Orders: max 25 per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_orders()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_owner UUID; v_cnt BIGINT; BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN RETURN NEW; END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.orders o WHERE o.restaurant_id = NEW.restaurant_id;
        IF v_cnt >= 25 THEN RAISE EXCEPTION 'Free tier limit: only 25 orders allowed' USING ERRCODE='P0001'; END IF;
    END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_enforce_free_tier_orders ON servu.orders;
CREATE TRIGGER trg_enforce_free_tier_orders BEFORE INSERT ON servu.orders FOR EACH ROW EXECUTE FUNCTION servu.enforce_free_tier_orders();

-- Cash closings: max 2 per month per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_cash_closings()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE v_owner UUID; v_cnt BIGINT; BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN RETURN NEW; END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.cash_closings cc WHERE cc.restaurant_id = NEW.restaurant_id AND date_trunc('month', cc.closing_date) = date_trunc('month', NEW.closing_date);
        IF v_cnt >= 2 THEN RAISE EXCEPTION 'Free tier limit: only 2 cash closings per month' USING ERRCODE='P0001'; END IF;
    END IF; RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_enforce_free_tier_cash_closings ON servu.cash_closings;
CREATE TRIGGER trg_enforce_free_tier_cash_closings BEFORE INSERT ON servu.cash_closings FOR EACH ROW EXECUTE FUNCTION servu.enforce_free_tier_cash_closings();

