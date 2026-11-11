const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Ensure platform_settings table exists
run(`
  CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const defaultSettings = {
  store_name: 'Freshbunch Luxury Gifting',
  store_tagline: 'Handcrafted Gourmet Cakes, Exotic Blooms & Keepsakes',
  support_email: 'concierge@freshbunch.com',
  support_phone: '+91 98765 43210',
  store_address: 'Flagship Studio, 100ft Road, Indiranagar, Bengaluru, KA 560038',
  currency_symbol: '₹',
  timezone: 'Asia/Kolkata',
  is_accepting_orders: 'true',
  min_order_free_shipping: '599',
  default_delivery_charge: '49',
  same_day_cutoff_time: '18:00',
  auto_assign_delivery_boy: 'true',
  master_chef_name: 'Chef Marco Pierre',
  dispatch_lead_name: 'Rahul Verma',
  whatsapp_notifications_enabled: 'true',
  email_notifications_enabled: 'true',
  maintenance_mode: 'false'
};

// Seed default settings if empty
for (const [k, v] of Object.entries(defaultSettings)) {
  const existing = get('SELECT key FROM platform_settings WHERE key = ?', [k]);
  if (!existing) {
    run('INSERT INTO platform_settings (key, value) VALUES (?, ?)', [k, v]);
  }
}

// 1. Get all platform settings
router.get('/', requireAdmin, (req, res) => {
  try {
    const rows = query('SELECT key, value FROM platform_settings');
    const settings = { ...defaultSettings };
    for (const r of rows) {
      settings[r.key] = r.value;
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Update platform settings
router.put('/', requireAdmin, (req, res) => {
  try {
    const updates = req.body;
    for (const [k, v] of Object.entries(updates)) {
      const valStr = typeof v === 'boolean' ? String(v) : String(v || '');
      run(`
        INSERT INTO platform_settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
      `, [k, valStr]);
    }

    const rows = query('SELECT key, value FROM platform_settings');
    const settings = { ...defaultSettings };
    for (const r of rows) {
      settings[r.key] = r.value;
    }

    res.json({ success: true, message: 'Settings saved successfully', settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. System Health & Database Diagnostics
router.get('/diagnostics', requireAdmin, (req, res) => {
  try {
    const counts = {
      users: get('SELECT COUNT(*) as count FROM users')?.count || 0,
      products: get('SELECT COUNT(*) as count FROM products')?.count || 0,
      categories: get('SELECT COUNT(*) as count FROM categories')?.count || 0,
      orders: get('SELECT COUNT(*) as count FROM orders')?.count || 0,
      shops: get('SELECT COUNT(*) as count FROM shops')?.count || 0,
      deliveryBoys: get('SELECT COUNT(*) as count FROM delivery_boys')?.count || 0,
      reviews: get('SELECT COUNT(*) as count FROM reviews')?.count || 0,
      coupons: get('SELECT COUNT(*) as count FROM coupons')?.count || 0
    };

    const dbPath = path.join(__dirname, '..', '..', 'data', 'freshbunch.db');
    let dbSizeKb = 0;
    if (fs.existsSync(dbPath)) {
      const stat = fs.statSync(dbPath);
      dbSizeKb = Math.round(stat.size / 1024);
    }

    res.json({
      success: true,
      diagnostics: {
        serverTime: new Date().toISOString(),
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        database: {
          engine: 'SQLite3 (node:sqlite DatabaseSync)',
          mode: 'WAL (Write-Ahead Logging)',
          sizeKb: dbSizeKb,
          counts
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
