const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'freshbunch.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for integrity and concurrency
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer', -- 'admin', 'customer'
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      short_desc TEXT,
      base_price REAL NOT NULL,
      discount_price REAL,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 5,
      sku TEXT UNIQUE NOT NULL,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_bestseller INTEGER DEFAULT 0,
      images_json TEXT NOT NULL DEFAULT '[]', -- JSON array of URLs
      custom_attributes_schema TEXT DEFAULT '{}', -- category-specific config
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      variant_name TEXT NOT NULL,
      attribute_name TEXT NOT NULL,
      attribute_value TEXT NOT NULL,
      price_adjustment REAL DEFAULT 0,
      stock_qty INTEGER DEFAULT 0,
      sku TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
      discount_value REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      max_discount_amount REAL,
      start_date DATE,
      expiry_date DATE,
      usage_limit INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_pincodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pincode TEXT UNIQUE NOT NULL,
      area_name TEXT NOT NULL,
      city TEXT NOT NULL,
      delivery_charge REAL DEFAULT 0,
      min_free_delivery_amount REAL DEFAULT 500,
      same_day_cutoff_time TEXT DEFAULT '17:00',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS delivery_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slot_name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      slot_charge REAL DEFAULT 0,
      max_orders_per_slot INTEGER DEFAULT 50,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      guest_info_json TEXT, -- { name, email, phone }
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      delivery_charge REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      coupon_id INTEGER,
      payment_method TEXT NOT NULL, -- 'upi_online', 'cod'
      payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
      order_status TEXT NOT NULL DEFAULT 'new', -- 'new', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'
      delivery_pincode TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      delivery_city TEXT NOT NULL,
      delivery_date DATE NOT NULL,
      delivery_slot TEXT NOT NULL,
      special_instructions TEXT,
      cancellation_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name_snapshot TEXT NOT NULL,
      product_image_snapshot TEXT,
      unit_price_snapshot REAL NOT NULL,
      discount_price_snapshot REAL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL,
      customization_details_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS customer_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      is_verified_purchase INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- CRM Tables
    CREATE TABLE IF NOT EXISTS crm_interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      order_id INTEGER,
      customer_name TEXT,
      customer_phone TEXT,
      channel TEXT NOT NULL DEFAULT 'whatsapp', -- 'whatsapp', 'call', 'email', 'note', 'sms'
      direction TEXT NOT NULL DEFAULT 'outbound', -- 'outbound', 'inbound'
      subject TEXT,
      content TEXT NOT NULL,
      created_by TEXT DEFAULT 'Support Team',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS crm_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
      due_date DATE,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed'
      assigned_to TEXT,
      customer_id INTEGER,
      customer_name TEXT,
      order_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS crm_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      target_segment TEXT NOT NULL, -- 'vip', 'birthdays_this_week', 'anniversaries', 'at_risk', 'all'
      coupon_code TEXT,
      channel TEXT DEFAULT 'whatsapp',
      message_template TEXT NOT NULL,
      recipients_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'sent', -- 'draft', 'scheduled', 'sent'
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Multi-Shop / Multi-Vendor Management
    CREATE TABLE IF NOT EXISTS shops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      owner_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT DEFAULT 'Bangalore',
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Delivery Personnel (Delivery Boys / Couriers)
    CREATE TABLE IF NOT EXISTS delivery_boys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      vehicle_type TEXT DEFAULT 'bike', -- 'bike', 'scooter', 'van'
      vehicle_number TEXT,
      city TEXT DEFAULT 'Bangalore',
      service_zone TEXT,
      status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'on_delivery'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_crm_interactions_user ON crm_interactions(user_id);
  `);

  // Migrate existing tables for CRM & SaaS Shop columns safely
  const migrations = [
    `ALTER TABLE users ADD COLUMN lifecycle_stage TEXT DEFAULT 'lead'`,
    `ALTER TABLE users ADD COLUMN tags_json TEXT DEFAULT '[]'`,
    `ALTER TABLE users ADD COLUMN occasions_json TEXT DEFAULT '[]'`,
    `ALTER TABLE users ADD COLUMN notes TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN preferred_category TEXT DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN company_name TEXT DEFAULT ''`,
    `ALTER TABLE orders ADD COLUMN assigned_staff TEXT DEFAULT 'Bakery Master Chef'`,
    `ALTER TABLE orders ADD COLUMN assigned_rider TEXT DEFAULT 'Express Dispatcher'`,
    `ALTER TABLE products ADD COLUMN shop_id INTEGER REFERENCES shops(id)`,
    `ALTER TABLE orders ADD COLUMN shop_id INTEGER REFERENCES shops(id)`,
    `ALTER TABLE orders ADD COLUMN delivery_boy_id INTEGER REFERENCES delivery_boys(id)`,
    `ALTER TABLE orders ADD COLUMN delivery_boy_name TEXT`
  ];

  for (const m of migrations) {
    try {
      db.exec(m);
    } catch (e) {
      // Column already exists, safe to ignore
    }
  }

  // Create indices on migrated columns
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
      CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id);
      CREATE INDEX IF NOT EXISTS idx_orders_delivery_boy ON orders(delivery_boy_id);
    `);
  } catch (e) {
    // ignore
  }
}

// Helper methods
const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
};

const get = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
};

const run = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

// Transaction wrapper
const transaction = (fn) => {
  db.exec('BEGIN TRANSACTION;');
  try {
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
};

module.exports = {
  db,
  initDatabase,
  query,
  get,
  run,
  transaction
};
