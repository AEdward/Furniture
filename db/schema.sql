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
  image_url VARCHAR(500) NULL,
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

-- Single-row key/value store for site-wide settings (name, tagline,
-- contact info, home hero, delivery/warranty/returns/payment policy).
-- One row per key; the "site" key holds the whole settings object as JSON.
CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  value LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Admin-authored pages, rendered at /<slug>. Content is an ordered array
-- of typed blocks (hero / richtext / imagetext) stored as JSON.
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(191) NOT NULL UNIQUE,
  title VARCHAR(191) NOT NULL,
  meta_description VARCHAR(255) NULL,
  blocks_json LONGTEXT NOT NULL,
  show_in_nav TINYINT(1) NOT NULL DEFAULT 0,
  nav_label VARCHAR(64) NULL,
  nav_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per storefront page load, logged by the client-side tracker in
-- app/(site)/layout.tsx. No IP address, user agent, or cookie/session id
-- is stored — just enough to show admin traffic analytics.
CREATE TABLE IF NOT EXISTS page_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(255) NOT NULL,
  referrer VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_page_views_created_at (created_at),
  INDEX idx_page_views_path (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cache of machine-translated strings (see lib/translate.ts), keyed by a
-- hash of (target language + source text) so repeat page loads reuse a
-- translation instead of re-calling the translation API. TEXT columns
-- can't be uniquely indexed directly in MySQL, hence the hash column.
CREATE TABLE IF NOT EXISTS translations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source_hash CHAR(40) NOT NULL,
  lang VARCHAR(8) NOT NULL,
  source_text MEDIUMTEXT NOT NULL,
  translated_text MEDIUMTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_translations_hash (source_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
