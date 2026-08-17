CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(191) PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  category VARCHAR(64) NOT NULL,
  price INT NOT NULL,
  compare_at_price INT NULL,
  description TEXT NOT NULL,
  details_json TEXT NOT NULL,
  icon VARCHAR(64) NOT NULL,
  gradient VARCHAR(64) NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  is_new TINYINT(1) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,

  sku VARCHAR(64) NOT NULL DEFAULT '',
  availability VARCHAR(32) NOT NULL DEFAULT 'in_stock',
  lead_time_days INT NULL,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,

  width_cm INT NOT NULL DEFAULT 0,
  depth_cm INT NOT NULL DEFAULT 0,
  height_cm INT NOT NULL DEFAULT 0,
  seat_height_cm INT NULL,
  seat_depth_cm INT NULL,
  arm_height_cm INT NULL,
  leg_height_cm INT NULL,
  weight_kg INT NULL,

  frame_material VARCHAR(191) NOT NULL DEFAULT '',
  upholstery_material VARCHAR(191) NULL,
  legs_material VARCHAR(191) NULL,
  foam_density VARCHAR(64) NULL,

  colors_json TEXT NOT NULL DEFAULT '[]',
  material_options_json TEXT NOT NULL DEFAULT '[]',
  wood_options_json TEXT NOT NULL DEFAULT '[]',

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(191) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  address VARCHAR(191) NOT NULL,
  city VARCHAR(191) NOT NULL,
  postal_code VARCHAR(32) NOT NULL,
  subtotal INT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'placed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_slug VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  price INT NOT NULL,
  quantity INT NOT NULL,
  variant_label VARCHAR(191) NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
