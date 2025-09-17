-- Free-tier limits enforced at DB level via triggers
-- Requires: servu.subscriptions (user-based), servu.users, servu.restaurants, servu.menu_items,
--           servu.raw_ingredients, servu.orders, servu.cash_closings

SET search_path TO servu, public;

-- Helper: check if a user has an active subscription
CREATE OR REPLACE FUNCTION servu.is_free_tier(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM servu.subscriptions s
        WHERE s.user_id = p_user_id
          AND s.status = 'active'
          AND s.current_period_end > CURRENT_TIMESTAMP
    ) INTO v_active;

    RETURN NOT COALESCE(v_active, FALSE);
END;
$$;

-- 1) Restaurants: free tier => max 1 restaurant per owner
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_restaurants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_cnt BIGINT;
BEGIN
    IF servu.is_free_tier(NEW.owner_id) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.restaurants r WHERE r.owner_id = NEW.owner_id;
        IF v_cnt >= 1 THEN
            RAISE EXCEPTION 'Free tier limit: only 1 restaurant allowed' USING ERRCODE = 'P0001';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_tier_restaurants ON servu.restaurants;
CREATE TRIGGER trg_enforce_free_tier_restaurants
BEFORE INSERT ON servu.restaurants
FOR EACH ROW
EXECUTE FUNCTION servu.enforce_free_tier_restaurants();

-- 2) Menu items: free tier => max 5 items per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_menu_items()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner UUID;
    v_cnt BIGINT;
BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN
        RETURN NEW; -- restaurant deleted or not found; let FK handle
    END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.menu_items m WHERE m.restaurant_id = NEW.restaurant_id;
        IF v_cnt >= 5 THEN
            RAISE EXCEPTION 'Free tier limit: only 5 menu items allowed' USING ERRCODE = 'P0001';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_tier_menu_items ON servu.menu_items;
CREATE TRIGGER trg_enforce_free_tier_menu_items
BEFORE INSERT ON servu.menu_items
FOR EACH ROW
EXECUTE FUNCTION servu.enforce_free_tier_menu_items();

-- 3) Raw ingredients: free tier => max 25 per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_raw_ingredients()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner UUID;
    v_cnt BIGINT;
BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN
        RETURN NEW;
    END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.raw_ingredients ri WHERE ri.restaurant_id = NEW.restaurant_id;
        IF v_cnt >= 25 THEN
            RAISE EXCEPTION 'Free tier limit: only 25 ingredients allowed' USING ERRCODE = 'P0001';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_tier_raw_ingredients ON servu.raw_ingredients;
CREATE TRIGGER trg_enforce_free_tier_raw_ingredients
BEFORE INSERT ON servu.raw_ingredients
FOR EACH ROW
EXECUTE FUNCTION servu.enforce_free_tier_raw_ingredients();

-- 4) Waiter users: free tier => max 3 waiter accounts per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_waiters()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner UUID;
    v_cnt BIGINT;
BEGIN
    -- Only apply for waiter role and when restaurant_id is provided
    IF NEW.role = 'waiter' AND NEW.restaurant_id IS NOT NULL THEN
        SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
        IF v_owner IS NULL THEN
            RETURN NEW;
        END IF;
        IF servu.is_free_tier(v_owner) THEN
            SELECT COUNT(*) INTO v_cnt FROM servu.users u WHERE u.restaurant_id = NEW.restaurant_id AND u.role = 'waiter';
            IF v_cnt >= 3 THEN
                RAISE EXCEPTION 'Free tier limit: only 3 waiter users allowed' USING ERRCODE = 'P0001';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_tier_waiters ON servu.users;
CREATE TRIGGER trg_enforce_free_tier_waiters
BEFORE INSERT ON servu.users
FOR EACH ROW
EXECUTE FUNCTION servu.enforce_free_tier_waiters();

-- 5) Orders: free tier => max 25 orders per restaurant (total)
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner UUID;
    v_cnt BIGINT;
BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN
        RETURN NEW;
    END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt FROM servu.orders o WHERE o.restaurant_id = NEW.restaurant_id;
        IF v_cnt >= 25 THEN
            RAISE EXCEPTION 'Free tier limit: only 25 orders allowed' USING ERRCODE = 'P0001';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_tier_orders ON servu.orders;
CREATE TRIGGER trg_enforce_free_tier_orders
BEFORE INSERT ON servu.orders
FOR EACH ROW
EXECUTE FUNCTION servu.enforce_free_tier_orders();

-- 6) Cash closings: free tier => max 2 per month per restaurant
CREATE OR REPLACE FUNCTION servu.enforce_free_tier_cash_closings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_owner UUID;
    v_cnt BIGINT;
BEGIN
    SELECT owner_id INTO v_owner FROM servu.restaurants WHERE restaurant_id = NEW.restaurant_id;
    IF v_owner IS NULL THEN
        RETURN NEW;
    END IF;
    IF servu.is_free_tier(v_owner) THEN
        SELECT COUNT(*) INTO v_cnt
        FROM servu.cash_closings cc
        WHERE cc.restaurant_id = NEW.restaurant_id
          AND date_trunc('month', cc.closing_date) = date_trunc('month', NEW.closing_date);
        IF v_cnt >= 2 THEN
            RAISE EXCEPTION 'Free tier limit: only 2 cash closings per month' USING ERRCODE = 'P0001';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_free_tier_cash_closings ON servu.cash_closings;
CREATE TRIGGER trg_enforce_free_tier_cash_closings
BEFORE INSERT ON servu.cash_closings
FOR EACH ROW
EXECUTE FUNCTION servu.enforce_free_tier_cash_closings();

-- Note: No events table found; add similar trigger when events table exists.

