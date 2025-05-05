-- Enable the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS servu;

-- Create a trigger function to update `updated_at` automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE servu.users (
                             user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             name VARCHAR(100),
                             email VARCHAR(100) UNIQUE NOT NULL,
                             password_hash TEXT NOT NULL,
                             id_number VARCHAR(100) UNIQUE DEFAULT NULL,
                             phone VARCHAR(100) UNIQUE NOT NULL,
                             nit_number VARCHAR(100) UNIQUE DEFAULT NULL,
                             role VARCHAR(20) CHECK (role IN ('admin', 'waiter', 'customer')) NOT NULL,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX idx_users_email ON servu.users(email);
CREATE INDEX idx_users_phone ON servu.users(phone);
CREATE INDEX idx_users_role ON servu.users(role);

CREATE TABLE servu.restaurants (
                                   restaurant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                   name VARCHAR(255) NOT NULL,
                                   description TEXT,
                                   image_url TEXT,
                                   owner_id UUID REFERENCES servu.users(user_id) ON DELETE SET NULL,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for restaurants table
CREATE INDEX idx_restaurants_name ON servu.restaurants(name);
CREATE INDEX idx_restaurants_owner_id ON servu.restaurants(owner_id);

CREATE TABLE servu.tables (
                                         table_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         restaurant_id UUID REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
                                         table_number INT NOT NULL,
                                         qr_code TEXT UNIQUE NOT NULL, -- QR Code stores table-specific URL or identifier
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for tables table
CREATE INDEX idx_tables_restaurant_id ON servu.tables(restaurant_id);
CREATE INDEX idx_tables_table_number ON servu.tables(table_number);
CREATE INDEX idx_tables_qr_code ON servu.tables(qr_code);

CREATE TABLE servu.menu_items (
                                  menu_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  restaurant_id UUID REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
                                  name VARCHAR(255) NOT NULL,
                                  description TEXT,
                                  price DECIMAL(10,2) NOT NULL,
                                  available BOOLEAN DEFAULT TRUE,
                                  category VARCHAR(20) CHECK (category IN ('Appetizer', 'Dessert', 'Main','Soup','Salad','Drinks')) NOT NULL,
                                  image_url TEXT
);

-- Indexes for menu_items table
CREATE INDEX idx_menu_items_restaurant_id ON servu.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_name ON servu.menu_items(name);
CREATE INDEX idx_menu_items_category ON servu.menu_items(category);
CREATE INDEX idx_menu_items_available ON servu.menu_items(available);

CREATE TABLE servu.orders (
                              order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              table_id UUID REFERENCES servu.tables(table_id) ON DELETE CASCADE,
                              restaurant_id UUID REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
                              status VARCHAR(20) CHECK (status IN ('ordered', 'delivered', 'payed', 'cancelled')) DEFAULT 'ordered',
                              total_price DECIMAL(10,2) DEFAULT 0.0,
                              observation TEXT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for orders table
CREATE INDEX idx_orders_table_id ON servu.orders(table_id);
CREATE INDEX idx_orders_restaurant_id ON servu.orders(restaurant_id);
CREATE INDEX idx_orders_status ON servu.orders(status);
CREATE INDEX idx_orders_created_at ON servu.orders(created_at);

CREATE TABLE servu.order_items (
                                   order_id UUID REFERENCES servu.orders(order_id) ON DELETE CASCADE,
                                   menu_item_id UUID REFERENCES servu.menu_items(menu_item_id) ON DELETE CASCADE,
                                   quantity INT CHECK (quantity > 0),
                                   price DECIMAL(10,2) NOT NULL, -- Price at the time of order
                                   observation TEXT,
                                   PRIMARY KEY (order_id, menu_item_id)
);

-- Indexes for order_items table
CREATE INDEX idx_order_items_menu_item_id ON servu.order_items(menu_item_id);

CREATE TABLE servu.payments (
                                payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                order_id UUID REFERENCES servu.orders(order_id) ON DELETE CASCADE,
                                restaurant_id UUID REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
                                amount DECIMAL(10,2) NOT NULL,
                                status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
                                payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'online')),
                                transaction_id TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payments table
CREATE INDEX idx_payments_order_id ON servu.payments(order_id);
CREATE INDEX idx_payments_status ON servu.payments(status);
CREATE INDEX idx_payments_payment_method ON servu.payments(payment_method);
CREATE INDEX idx_payments_created_at ON servu.payments(created_at);

ALTER TABLE servu.users
ADD COLUMN restaurant_id UUID;

ALTER TABLE servu.users
ADD CONSTRAINT fk_users_restaurant
FOREIGN KEY (restaurant_id)
REFERENCES servu.restaurants(restaurant_id)
ON DELETE SET NULL;
