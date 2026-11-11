const express = require('express');
const router = express.Router();
const { query, get } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Admin Overview Dashboard Metrics
router.get('/overview', requireAdmin, (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Total Revenue
  const revRow = get(`SELECT SUM(total_amount) as total_revenue FROM orders WHERE order_status != 'cancelled'`);
  const totalRevenue = revRow && revRow.total_revenue ? Number(revRow.total_revenue) : 0;

  // 2. Order counts
  const totalOrdersRow = get('SELECT COUNT(*) as count FROM orders');
  const todayOrdersRow = get('SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?', [todayStr]);
  const pendingOrdersRow = get("SELECT COUNT(*) as count FROM orders WHERE order_status IN ('new', 'confirmed')");
  const confirmedOrdersRow = get("SELECT COUNT(*) as count FROM orders WHERE order_status = 'confirmed'");
  const preparingOrdersRow = get("SELECT COUNT(*) as count FROM orders WHERE order_status = 'preparing'");
  const deliveredOrdersRow = get("SELECT COUNT(*) as count FROM orders WHERE order_status = 'delivered'");
  const cancelledOrdersRow = get("SELECT COUNT(*) as count FROM orders WHERE order_status = 'cancelled'");

  // 3. Product & inventory metrics
  const totalProductsRow = get('SELECT COUNT(*) as count FROM products');
  const lowStockRow = get('SELECT COUNT(*) as count FROM products WHERE stock_qty <= low_stock_threshold AND is_active = 1');
  const outOfStockRow = get('SELECT COUNT(*) as count FROM products WHERE stock_qty = 0 AND is_active = 1');

  // 4. Low stock products list
  const lowStockProducts = query(`
    SELECT p.id, p.name, p.sku, p.stock_qty, p.low_stock_threshold, c.name as category_name
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.stock_qty <= p.low_stock_threshold
    ORDER BY p.stock_qty ASC
    LIMIT 6
  `);

  // 5. Recent Orders
  const recentOrders = query(`
    SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
           o.payment_method, o.delivery_date, o.delivery_slot, o.created_at, o.guest_info_json,
           u.full_name as user_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.id DESC
    LIMIT 6
  `).map(ord => {
    const guest = JSON.parse(ord.guest_info_json || '{}');
    return {
      ...ord,
      customer_name: ord.user_name || guest.name || 'Guest'
    };
  });

  res.json({
    success: true,
    metrics: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: totalOrdersRow ? totalOrdersRow.count : 0,
      todayOrders: todayOrdersRow ? todayOrdersRow.count : 0,
      pendingOrders: pendingOrdersRow ? pendingOrdersRow.count : 0,
      confirmedOrders: confirmedOrdersRow ? confirmedOrdersRow.count : 0,
      preparingOrders: preparingOrdersRow ? preparingOrdersRow.count : 0,
      deliveredOrders: deliveredOrdersRow ? deliveredOrdersRow.count : 0,
      cancelledOrders: cancelledOrdersRow ? cancelledOrdersRow.count : 0,
      totalProducts: totalProductsRow ? totalProductsRow.count : 0,
      lowStockCount: lowStockRow ? lowStockRow.count : 0,
      outOfStockCount: outOfStockRow ? outOfStockRow.count : 0
    },
    lowStockProducts,
    recentOrders
  });
});

// Sales Trend for charts (Last 7 days)
router.get('/sales-trend', requireAdmin, (req, res) => {
  const trend = query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(id) as order_count,
      COALESCE(SUM(CASE WHEN order_status != 'cancelled' THEN total_amount ELSE 0 END), 0) as revenue
    FROM orders
    WHERE created_at >= DATE('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
  `);

  res.json({ success: true, trend });
});

// Top Selling Products
router.get('/top-products', requireAdmin, (req, res) => {
  const topProducts = query(`
    SELECT 
      oi.product_id,
      oi.product_name_snapshot as name,
      oi.product_image_snapshot as image,
      SUM(oi.quantity) as total_sold_qty,
      SUM(oi.line_total) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.order_status != 'cancelled'
    GROUP BY oi.product_id
    ORDER BY total_sold_qty DESC
    LIMIT 6
  `);

  res.json({ success: true, topProducts });
});

// Customer management list
router.get('/customers', requireAdmin, (req, res) => {
  const customers = query(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      u.created_at,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_spent
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY u.id DESC
  `);

  res.json({ success: true, customers });
});

module.exports = router;
