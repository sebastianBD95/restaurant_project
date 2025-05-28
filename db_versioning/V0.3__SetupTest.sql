-- Mock test data for servu schema
-- UUIDs are static for reproducibility

/*
Alice Admin: admin123
Bob Waiter: waiter123
Charlie Customer: customer123
*/
-- USERS
INSERT INTO servu.users (user_id, name, email, password_hash, id_number, phone, nit_number, role, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alicia Administradora', 'alice@admin.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'ID001', '555-0001', 'NIT001', 'admin', CURRENT_TIMESTAMP);
  
-- RESTAURANTS
INSERT INTO servu.restaurants (restaurant_id, name, description, image_url, owner_id, created_at)
VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'El Sabor Colombiano', 'Un restaurante familiar y acogedor', 'https://servu-web.s3.us-east-1.amazonaws.com/TestMock/restaurant/Brucheta.jpeg', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP);
 
-- WAITERS
-- USERS
INSERT INTO servu.users (user_id, name, email, password_hash, id_number, phone, nit_number, role, restaurant_id, created_at)
VALUES
    ('22222222-2222-2222-2222-222222222222', 'Roberto Mesero', 'bob@waiter.com', '$2a$10$kaQM52AVZxmOvr592U5ZNuOWUu/SNtjxVjRwZmVszMFXnhDtezsXe', 'ID002', '555-0002', 'NIT002', 'waiter', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', CURRENT_TIMESTAMP);
  
-- TABLES
INSERT INTO servu.tables (table_id, restaurant_id, table_number, qr_code, status, created_at)
VALUES
  ('bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 1, 'QR1', 'available', CURRENT_TIMESTAMP),
  ('bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 2, 'QR2', 'occupied', CURRENT_TIMESTAMP);


-- MENU ITEMS
INSERT INTO servu.menu_items (menu_item_id, restaurant_id, name, description, price, available, category, image_url)
VALUES
  ('ccccccc1-cccc-cccc-cccc-ccccccccccc1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Bife a la Criolla', 'Bife a la criolla con papas fritas y ensalada', 50000, TRUE, 'Main', 'https://servu-web.s3.us-east-1.amazonaws.com/TestMock/menu/bife.jpg'),
  ('ccccccc2-cccc-cccc-cccc-ccccccccccc2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pasta Alfredo', 'Pasta Alfredo con champiñones y queso', 25000, TRUE, 'Main', 'https://servu-web.s3.us-east-1.amazonaws.com/TestMock/menu/Alfredo.jpg');

-- INGREDIENTS
INSERT INTO servu.ingredients (ingredient_id, menu_item_id, raw_ingredient_id, price, amount, unit)
VALUES
  ('ddddddd1-dddd-dddd-dddd-ddddddddddd1', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 35, 12000, 200, 'g'),
  ('ddddddd2-dddd-dddd-dddd-ddddddddddd2', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 63, 4000, 10, 'g'),
  ('ddddddd3-dddd-dddd-dddd-ddddddddddd3', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 60, 3200, 3, 'g'),
  ('ddddddd4-dddd-dddd-dddd-ddddddddddd4', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 53, 4000, 200, 'g'),
  ('ddddddd5-dddd-dddd-dddd-ddddddddddd5', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2',94, 4000, 100, 'g'),
  ('ddddddd6-dddd-dddd-dddd-ddddddddddd6', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 26, 4000, 200, 'g');

-- INVENTORIES
INSERT INTO servu.inventories (inventory_id, restaurant_id, raw_ingredient_id, quantity, unit, minimum_quantity, last_restock_date, price, merma, created_at, updated_at)
VALUES
  ('eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 35, 1000, 'g', 200, CURRENT_TIMESTAMP, 1600, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee2-eeee-eeee-eeee-eeeeeeeeeee2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 63, 500, 'g', 100, CURRENT_TIMESTAMP, 8000, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee3-eeee-eeee-eeee-eeeeeeeeeee3', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 60, 2000, 'g', 500, CURRENT_TIMESTAMP, 1200, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee4-eeee-eeee-eeee-eeeeeeeeeee4', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 53, 1000, 'g', 200, CURRENT_TIMESTAMP, 1600, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee5-eeee-eeee-eeee-eeeeeeeeeee5', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 94, 500, 'g', 100, CURRENT_TIMESTAMP, 8000, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee6-eeee-eeee-eeee-eeeeeeeeeee6', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 26, 2000, 'g', 500, CURRENT_TIMESTAMP, 1200, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ORDERS
INSERT INTO servu.orders (order_id, table_id, restaurant_id, status, total_price, observation, created_at)
VALUES
  ('fffffff1-ffff-ffff-ffff-fffffffffff1', 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'ordered', 75000, 'No onions', CURRENT_TIMESTAMP),
  ('fffffff2-ffff-ffff-ffff-fffffffffff2', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'paid', 50000, 'Sin observaciones', CURRENT_TIMESTAMP),
  ('fffffff3-ffff-ffff-ffff-fffffffffff3', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'paid', 25000, 'Sin observaciones', CURRENT_TIMESTAMP);

-- ORDER ITEMS
INSERT INTO servu.order_items (order_id, menu_item_id, quantity, price, observation, status, void_reason)
VALUES
  ('fffffff1-ffff-ffff-ffff-fffffffffff1', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 1, 50000, '', 'pending', NULL),
  ('fffffff2-ffff-ffff-ffff-fffffffffff2', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 1, 50000, '', 'completed', NULL),
  ('fffffff3-ffff-ffff-ffff-fffffffffff3', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 1, 25000, '', 'completed', NULL);

-- PAYMENTS
INSERT INTO servu.payments (payment_id, order_id, restaurant_id, amount, status, payment_method, transaction_id, created_at)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'fffffff1-ffff-ffff-ffff-fffffffffff1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 75000, 'pending', 'card', 'TX123', CURRENT_TIMESTAMP),
  ('88888888-8888-8888-8888-888888888888', 'fffffff2-ffff-ffff-ffff-fffffffffff2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 50000, 'completed', 'cash', 'TX124', CURRENT_TIMESTAMP),
  ('99999999-9999-9999-9999-999999999999', 'fffffff3-ffff-ffff-ffff-fffffffffff3', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 25000, 'completed', 'card', 'TX125', CURRENT_TIMESTAMP);
