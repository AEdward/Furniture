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
  images_json TEXT NOT NULL DEFAULT '[]',
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
  customer_phone VARCHAR(32) NOT NULL DEFAULT '',
  address VARCHAR(191) NOT NULL,
  city VARCHAR(191) NOT NULL,
  postal_code VARCHAR(32) NOT NULL,
  subtotal INT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'placed',

  -- Payment. Separate from `status` above, which tracks fulfillment
  -- (placed/processing/shipped/...) — payment_status tracks whether
  -- money actually changed hands. payment_method is what the customer
  -- picked at checkout ('chapa' | 'cod' | 'bank_transfer'); for 'chapa'
  -- stock is only decremented once payment_status becomes 'paid' (see
  -- confirmOrderPayment in lib/db.ts), since that flow can be abandoned
  -- mid-redirect — 'cod'/'bank_transfer' decrement immediately at order
  -- creation instead, since there's no external step to abandon.
  payment_method VARCHAR(32) NOT NULL DEFAULT 'chapa',
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR(32) NULL,
  payment_ref VARCHAR(191) NULL,

  -- Identifies "this browser's current checkout attempt" (see
  -- lib/cart-context.tsx), so retrying after a failed/abandoned payment
  -- updates the same still-pending order instead of creating a new one.
  cart_session_id VARCHAR(64) NULL,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_payment_ref (payment_ref),
  INDEX idx_orders_cart_session (cart_session_id)
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

-- Named admin accounts (replaces the old single shared ADMIN_PASSWORD).
-- Deliberately not dropped/reseeded by db/seed.ts like the demo content
-- tables above — accounts added via /admin/users should survive a
-- reseed after a schema change, not disappear.
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_admin_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Idempotent add-column for databases created before roles existed —
-- admin_users is preserved across reseeds (see comment above), so a
-- fresh CREATE TABLE IF NOT EXISTS never runs against an existing one.
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role ENUM('admin', 'editor') NOT NULL DEFAULT 'admin' AFTER password_hash;

-- Contact form submissions — previously the form just faked success
-- client-side and the message went nowhere. Dropped/recreated on reseed
-- like orders above, since this whole script is dev/demo tooling.
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_contact_messages_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer-submitted product reviews. New reviews start unapproved so
-- an admin moderates before they appear publicly (see lib/db.ts
-- getApprovedReviews vs getAllReviews). Dropped/recreated on reseed
-- like orders/contact_messages above.
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(191) NOT NULL,
  customer_name VARCHAR(191) NOT NULL,
  customer_email VARCHAR(191) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NOT NULL,
  approved TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_reviews_product_approved (product_id, approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- "Notify me when back in stock" signups. notified_at is set once the
-- email goes out (see lib/db.ts updateProduct, which fires it the
-- moment a product's availability moves away from out_of_stock).
-- Dropped/recreated on reseed like the other customer-submitted tables.
CREATE TABLE IF NOT EXISTS back_in_stock_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  notified_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_back_in_stock_product_email (product_id, email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
