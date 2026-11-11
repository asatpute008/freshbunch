const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// All shop management routes require Admin authorization
router.use(requireAdmin);

// 1. List all shops with metrics
router.get('/', (req, res) => {
  try {
    const shops = query(`
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT CASE WHEN o.order_status NOT IN ('closed', 'cancelled') THEN o.id END) as active_orders,
        COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as total_revenue
      FROM shops s
      LEFT JOIN products p ON p.shop_id = s.id
      LEFT JOIN orders o ON o.shop_id = s.id
      GROUP BY s.id
      ORDER BY s.id DESC
    `);

    res.json({ success: true, count: shops.length, shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get shop details and its products
router.get('/:id', (req, res) => {
  try {
    const shop = get(`
      SELECT 
        s.*,
        COUNT(DISTINCT p.id) as total_products,
        COUNT(DISTINCT CASE WHEN o.order_status NOT IN ('closed', 'cancelled') THEN o.id END) as active_orders
      FROM shops s
      LEFT JOIN products p ON p.shop_id = s.id
      LEFT JOIN orders o ON o.shop_id = s.id
      WHERE s.id = ? OR s.slug = ?
      GROUP BY s.id
    `, [req.params.id, req.params.id]);

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Fetch products belonging to this shop
    const products = query(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.shop_id = ?
      ORDER BY p.id DESC
    `, [shop.id]).map(p => ({
      ...p,
      images: JSON.parse(p.images_json || '[]'),
      custom_attributes: JSON.parse(p.custom_attributes_schema || '{}')
    }));

    res.json({ success: true, shop: { ...shop, products } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Add new shop
router.post('/', (req, res) => {
  try {
    const { name, owner_name, phone, email, address, city, description, image_url } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Shop name is required' });
    }

    // Generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = get('SELECT id FROM shops WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const result = run(`
      INSERT INTO shops (
        name, slug, owner_name, phone, email, address, city, description, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      name.trim(),
      slug,
      owner_name || '',
      phone || '',
      email || '',
      address || '',
      city || 'Bangalore',
      description || '',
      image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
    ]);

    const createdShop = get('SELECT * FROM shops WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      shop: createdShop
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update shop details
router.put('/:id', (req, res) => {
  try {
    const { name, owner_name, phone, email, address, city, status, description, image_url } = req.body;

    const shop = get('SELECT id FROM shops WHERE id = ?', [req.params.id]);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    run(`
      UPDATE shops SET
        name = COALESCE(?, name),
        owner_name = COALESCE(?, owner_name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        status = COALESCE(?, status),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name || null,
      owner_name !== undefined ? owner_name : null,
      phone !== undefined ? phone : null,
      email !== undefined ? email : null,
      address !== undefined ? address : null,
      city || null,
      status || null,
      description !== undefined ? description : null,
      image_url || null,
      shop.id
    ]);

    const updated = get('SELECT * FROM shops WHERE id = ?', [shop.id]);
    res.json({ success: true, message: 'Shop updated successfully', shop: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Delete shop
router.delete('/:id', (req, res) => {
  try {
    const shop = get('SELECT id FROM shops WHERE id = ?', [req.params.id]);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Unassign products from this shop or delete
    run('UPDATE products SET shop_id = NULL WHERE shop_id = ?', [shop.id]);
    run('DELETE FROM shops WHERE id = ?', [shop.id]);

    res.json({ success: true, message: 'Shop removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Add new product inside a specific shop
router.post('/:id/products', (req, res) => {
  try {
    const shop = get('SELECT id, name FROM shops WHERE id = ?', [req.params.id]);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const {
      category_id,
      name,
      description,
      short_desc,
      base_price,
      discount_price,
      stock_qty,
      low_stock_threshold,
      sku,
      images,
      custom_attributes_schema,
      is_active,
      is_featured,
      is_bestseller
    } = req.body;

    if (!name || !category_id || base_price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, Category ID, and Base Price are required' });
    }

    // Generate unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = get('SELECT id FROM products WHERE slug = ?', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const productSku = sku || `SKU-${Date.now().toString().slice(-6)}`;
    const imagesJson = JSON.stringify(images && images.length ? images : ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800']);

    const result = run(`
      INSERT INTO products (
        shop_id, category_id, name, slug, description, short_desc,
        base_price, discount_price, stock_qty, low_stock_threshold,
        sku, is_active, is_featured, is_bestseller, images_json, custom_attributes_schema
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      shop.id,
      category_id,
      name.trim(),
      slug,
      description || name,
      short_desc || '',
      Number(base_price),
      discount_price ? Number(discount_price) : null,
      Number(stock_qty) || 0,
      Number(low_stock_threshold) || 5,
      productSku,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      is_featured ? 1 : 0,
      is_bestseller ? 1 : 0,
      imagesJson,
      custom_attributes_schema ? JSON.stringify(custom_attributes_schema) : '{}'
    ]);

    const createdProduct = get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: `Product added to shop "${shop.name}" successfully`,
      product: {
        ...createdProduct,
        images: JSON.parse(createdProduct.images_json || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
