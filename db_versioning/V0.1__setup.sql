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
                             role VARCHAR(20) CHECK (role IN ('admin', 'waiter', 'customer')) NOT NULL,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servu.restaurants (
                                   restaurant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                   name VARCHAR(255) NOT NULL,
                                   owner_id UUID REFERENCES servu.users(user_id) ON DELETE SET NULL,
                                   address TEXT,
                                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servu.restaurant_tables (
                                         table_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                         restaurant_id UUID REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
                                         table_number INT NOT NULL,
                                         qr_code TEXT UNIQUE NOT NULL, -- QR Code stores table-specific URL or identifier
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servu.menus (
                             menu_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             restaurant_id UUID REFERENCES servu.restaurants(restaurant_id) ON DELETE CASCADE,
                             name VARCHAR(255) NOT NULL,
                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servu.menu_items (
                                  menu_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  menu_id UUID REFERENCES servu.menus(menu_id) ON DELETE CASCADE,
                                  name VARCHAR(255) NOT NULL,
                                  description TEXT,
                                  price DECIMAL(10,2) NOT NULL,
                                  available BOOLEAN DEFAULT TRUE,
                                  category VARCHAR(50),
                                  image_url TEXT
);

CREATE TABLE servu.orders (
                              order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                              table_id UUID REFERENCES servu.restaurant_tables(table_id) ON DELETE CASCADE,
                              status VARCHAR(20) CHECK (status IN ('ordered', 'delivered', 'payed', 'cancelled')) DEFAULT 'ordered',
                              total_price DECIMAL(10,2) DEFAULT 0.0,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE servu.order_items (
                                   order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                   order_id UUID REFERENCES servu.orders(order_id) ON DELETE CASCADE,
                                   menu_item_id UUID REFERENCES servu.menu_items(menu_item_id) ON DELETE CASCADE,
                                   quantity INT CHECK (quantity > 0),
                                   price DECIMAL(10,2) NOT NULL -- Price at the time of order
);

CREATE TABLE servu.payments (
                                payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                order_id UUID REFERENCES servu.orders(order_id) ON DELETE CASCADE,
                                amount DECIMAL(10,2) NOT NULL,
                                status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
                                payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'online')),
                                transaction_id TEXT,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);