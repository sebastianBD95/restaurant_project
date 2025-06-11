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
 
-- RAW INGREDIENTS
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tomate', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cebolla', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Ajo', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Zanahoria', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papa', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lechuga', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Espinaca', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pepino', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Brócoli', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Coliflor', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Calabacín', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Apio', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Berenjena', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Repollo', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Manzana', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Banano', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Naranja', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Fresa', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Piña', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mango', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Uva', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Melón', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papaya', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pollo entero', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pechuga de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Muslo de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Ala de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pierna de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cuello de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Molleja de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Hígado de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Patas de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Carne de res', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lomo de res', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Costilla de res', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Hígado de res', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Morrillo', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Falda de res', 'Res', 0.15);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pulpa negra', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Posta', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Rabo de res', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Carne de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Costilla de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lomo de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Chuleta de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pierna de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tocino', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Manitas de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Chicharrón', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Arroz', 'Cereal', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pan', 'Cereal', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pasta', 'Cereal', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Frijoles', 'Legumbre', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lentejas', 'Legumbre', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Garbanzos', 'Legumbre', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Queso', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Leche', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mantequilla', 'Grasa', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Aceite vegetal', 'Grasa', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Aceite de oliva', 'Grasa', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Sal', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Azúcar', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pimienta', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Comino', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Canela', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Laurel', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Harina de trigo', 'Harina', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Harina de maíz', 'Harina', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Harina de avena', 'Harina', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Harina de arroz', 'Harina', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Harina de yuca', 'Harina', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Maíz en grano', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Avena', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cebada', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Quinoa', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Arroz integral', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Trigo en grano', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Centeno', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Camarón', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Langostino', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pulpo', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Calamar', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mejillón', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Almeja', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Ostra', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pescado blanco', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tilapia', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Salmón', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Atún', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Bacalao', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Trucha', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Merluza', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Champiñón', 'Hongo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Seta', 'Hongo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Hongo shiitake', 'Hongo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Hongo portobello', 'Hongo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Punta de anca', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Picaña', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Sobrebarriga', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Entrecot', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Bistec', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Asado de tira', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Churrasco', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Vacío', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tapa de cuadril', 'Res', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Filete de pechuga', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Contramuslo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Menudencias de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Carcasa de pollo', 'Pollo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Bondiola', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lomo embuchado', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Panceta', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cabeza de cerdo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Costillar', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Solomillo', 'Cerdo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Langosta', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Percebe', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Bogavante', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cangrejo', 'Marisco', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Dorado', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Corvina', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Bagre', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mero', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Róbalo', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Sierra', 'Pescado', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tomate chonto', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tomate larga vida', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tomate cherry', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tomate pera', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cebolla cabezona', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cebolla larga', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papa criolla', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papa pastusa', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papa sabanera', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Zanahoria baby', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lechuga crespa', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lechuga romana', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Lechuga batavia', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pimentón rojo', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pimentón verde', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pimentón amarillo', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Ají dulce', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Ají picante', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Calabacín verde', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Calabacín amarillo', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Repollo verde', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Repollo morado', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Espinaca baby', 'Verdura', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Banano bocadillo', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Banano hartón', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Manzana roja', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Manzana verde', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Naranja valencia', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Naranja tangelo', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Piña oro miel', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Piña perolera', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mango tommy', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Mango de azúcar', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papaya maradol', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Papaya hawaiana', 'Fruta', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Queso costeño', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Queso campesino', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Queso doble crema', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Queso mozarella', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Queso cuajada', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Yogur natural', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Yogur de frutas', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Leche entera', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Leche deslactosada', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Leche en polvo', 'Lácteo', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Ají molido', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pimienta negra', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Pimienta blanca', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Canela en astilla', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Canela en polvo', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Cúrcuma', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Orégano seco', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Tomillo', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Laurel seco', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Clavo de olor', 'Condimento', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Café', 'Grano', 0.10);
INSERT INTO raw_ingredients (restaurant_id, name, category, merma) VALUES ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Agua', 'Liquido', 0.10);
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
  ('ddddddd2-dddd-dddd-dddd-ddddddddddd2', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 62, 4000, 10, 'g'),
  ('ddddddd3-dddd-dddd-dddd-ddddddddddd3', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 60, 3200, 3, 'g'),
  ('ddddddd4-dddd-dddd-dddd-ddddddddddd4', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 53, 4000, 200, 'g'),
  ('ddddddd5-dddd-dddd-dddd-ddddddddddd5', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2',94, 4000, 100, 'g'),
  ('ddddddd6-dddd-dddd-dddd-ddddddddddd6', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 26, 4000, 200, 'g');

-- INVENTORIES
INSERT INTO servu.inventories (inventory_id, restaurant_id, raw_ingredient_id, quantity, unit, minimum_quantity, last_restock_date, price, created_at, updated_at)
VALUES
  ('eeeeeee1-eeee-eeee-eeee-eeeeeeeeeee1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 35, 1000, 'g', 200, CURRENT_TIMESTAMP, 1600, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee2-eeee-eeee-eeee-eeeeeeeeeee2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 62, 500, 'g', 100, CURRENT_TIMESTAMP, 8000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee3-eeee-eeee-eeee-eeeeeeeeeee3', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 60, 2000, 'g', 500, CURRENT_TIMESTAMP, 1200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee4-eeee-eeee-eeee-eeeeeeeeeee4', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 53, 1000, 'g', 200, CURRENT_TIMESTAMP, 1600, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee5-eeee-eeee-eeee-eeeeeeeeeee5', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 94, 500, 'g', 100, CURRENT_TIMESTAMP, 8000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('eeeeeee6-eeee-eeee-eeee-eeeeeeeeeee6', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 26, 2000, 'g', 500, CURRENT_TIMESTAMP, 1200, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ORDERS
INSERT INTO servu.orders (order_id, table_id, restaurant_id, status, total_price, observation, created_at)
VALUES
  ('fffffff1-ffff-ffff-ffff-fffffffffff1', 'bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'ordered', 75000, 'No onions', CURRENT_TIMESTAMP),
  ('fffffff2-ffff-ffff-ffff-fffffffffff2', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'paid', 50000, 'Sin observaciones', CURRENT_TIMESTAMP),
  ('fffffff3-ffff-ffff-ffff-fffffffffff3', 'bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'paid', 25000, 'Sin observaciones', CURRENT_TIMESTAMP);

-- ORDER ITEMS
INSERT INTO servu.order_items (order_id, menu_item_id, quantity, price, observation, status)
VALUES
  ('fffffff1-ffff-ffff-ffff-fffffffffff1', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 1, 50000, 'Sin observaciones', 'pending'),
  ('fffffff1-ffff-ffff-ffff-fffffffffff1', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 1, 50000, 'Sin cebolla', 'pending'),
  ('fffffff1-ffff-ffff-ffff-fffffffffff1', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 1, 50000, 'Extra queso', 'pending'),
  ('fffffff2-ffff-ffff-ffff-fffffffffff2', 'ccccccc1-cccc-cccc-cccc-ccccccccccc1', 1, 50000, 'Sin observaciones', 'completed'),
  ('fffffff3-ffff-ffff-ffff-fffffffffff3', 'ccccccc2-cccc-cccc-cccc-ccccccccccc2', 1, 25000, 'Sin observaciones', 'completed');

-- PAYMENTS
INSERT INTO servu.payments (payment_id, order_id, restaurant_id, amount, status, payment_method, transaction_id, created_at)
VALUES
  ('77777777-7777-7777-7777-777777777777', 'fffffff1-ffff-ffff-ffff-fffffffffff1', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 75000, 'pending', 'card', 'TX123', CURRENT_TIMESTAMP),
  ('88888888-8888-8888-8888-888888888888', 'fffffff2-ffff-ffff-ffff-fffffffffff2', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 50000, 'completed', 'cash', 'TX124', CURRENT_TIMESTAMP),
  ('99999999-9999-9999-9999-999999999999', 'fffffff3-ffff-ffff-ffff-fffffffffff3', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 25000, 'completed', 'card', 'TX125', CURRENT_TIMESTAMP);
