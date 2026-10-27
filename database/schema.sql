CREATE DATABASE IF NOT EXISTS online_shopping
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE online_shopping;

CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  product_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sku VARCHAR(80) NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  mrp_price DECIMAL(10,2) DEFAULT NULL,
  unit_label VARCHAR(50) NOT NULL DEFAULT '1 piece',
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  image_url VARCHAR(500) DEFAULT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  popularity INT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id),
  UNIQUE KEY uq_products_sku (sku),
  KEY ix_products_category (category),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_rating CHECK (rating >= 0 AND rating <= 5)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
  order_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_number VARCHAR(40) NOT NULL,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(254) NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  status ENUM('demo_complete', 'pending', 'paid', 'cancelled') NOT NULL DEFAULT 'demo_complete',
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (order_id),
  UNIQUE KEY uq_orders_number (order_number),
  KEY ix_orders_user_created (user_id, created_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT chk_orders_total CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED DEFAULT NULL,
  product_name VARCHAR(160) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (order_item_id),
  KEY ix_order_items_order (order_id),
  KEY ix_order_items_product (product_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
  CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_items_price CHECK (unit_price >= 0 AND line_total >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  activity_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  session_id VARCHAR(100) NOT NULL,
  event_type ENUM('product_view', 'search', 'category_selection', 'add_to_cart', 'cart_removal', 'checkout_attempt', 'order_completed') NOT NULL,
  product_id BIGINT UNSIGNED DEFAULT NULL,
  category VARCHAR(80) DEFAULT NULL,
  search_query VARCHAR(200) DEFAULT NULL,
  order_id BIGINT UNSIGNED DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id),
  KEY ix_activity_created (created_at),
  KEY ix_activity_type_product (event_type, product_id),
  KEY ix_activity_session (session_id),
  CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_activity_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
  CONSTRAINT fk_activity_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO products (sku, name, category, description, price, mrp_price, unit_label, stock_quantity, image_url, rating, popularity) VALUES
  ('alphonso-mango', 'Ratnagiri Alphonso Mangoes', 'Fruits & Vegetables', 'Naturally ripened Ratnagiri Alphonso mangoes.', 349.00, 399.00, '1 dozen', 14, 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=82', 4.8, 98),
  ('nashik-onions', 'Nashik Red Onions', 'Fruits & Vegetables', 'Firm red onions sourced from Nashik.', 38.00, NULL, '1 kg', 42, 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=82', 4.6, 94),
  ('organic-tomatoes', 'Farm Fresh Tomatoes', 'Fruits & Vegetables', 'Juicy red tomatoes packed fresh today.', 32.00, NULL, '500 g', 28, 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=82', 4.5, 91),
  ('hill-bananas', 'Yelakki Bananas', 'Fruits & Vegetables', 'Naturally sweet Yelakki bananas.', 55.00, NULL, '6 pieces', 19, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=82', 4.7, 87),
  ('nagpur-oranges', 'Nagpur Sweet Oranges', 'Fruits & Vegetables', 'Juicy Nagpur oranges with a bright citrus flavour.', 89.00, NULL, '1 kg', 17, 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=82', 4.6, 80),
  ('basmati-rice', 'India Gate Basmati Rice', 'Groceries', 'Long-grain basmati rice with a delicate aroma.', 149.00, 179.00, '1 kg', 36, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=82', 4.8, 96),
  ('toor-dal', 'Tata Sampann Toor Dal', 'Groceries', 'Unpolished toor dal for everyday meals.', 168.00, NULL, '1 kg', 22, 'https://images.unsplash.com/photo-1515543904379-3d757891b3fc?auto=format&fit=crop&w=800&q=82', 4.7, 92),
  ('chakki-atta', 'Aashirvaad Shudh Chakki Atta', 'Groceries', 'Whole wheat chakki atta for soft rotis.', 269.00, NULL, '5 kg', 18, 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=800&q=82', 4.8, 95),
  ('cold-pressed-oil', 'Kachi Ghani Mustard Oil', 'Groceries', 'Aromatic cold-pressed mustard oil.', 189.00, NULL, '1 L', 11, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=82', 4.6, 79),
  ('masala-chai', 'Taj Mahal Tea', 'Snacks & Beverages', 'A bright, full-bodied tea blend.', 285.00, NULL, '500 g', 24, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=82', 4.8, 89),
  ('filter-coffee', 'South Indian Filter Coffee', 'Snacks & Beverages', 'A coffee and chicory blend for filter kaapi.', 175.00, NULL, '200 g', 8, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=82', 4.7, 76),
  ('marie-biscuits', 'Parle-G Gold Biscuits', 'Snacks & Beverages', 'Crisp, lightly sweet biscuits for tea time.', 35.00, NULL, '1 pack', 51, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=82', 4.5, 84)
ON DUPLICATE KEY UPDATE
  name = VALUES(name), category = VALUES(category), description = VALUES(description),
  price = VALUES(price), mrp_price = VALUES(mrp_price), unit_label = VALUES(unit_label),
  stock_quantity = VALUES(stock_quantity), image_url = VALUES(image_url), rating = VALUES(rating), popularity = VALUES(popularity);
