const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Public & Admin: Get products with dynamic filtering & sorting
router.get('/', (req, res) => {
  const {
    category,
    min_price,
    max_price,
    eggless,
    featured,
    bestseller,
    search,
    sort,
    all // admin view
  } = req.query;

  let whereClauses = [];
  let params = [];

  if (all !== 'true') {
    whereClauses.push('p.is_active = 1');
  }

  if (category) {
    if (isNaN(Number(category))) {
      whereClauses.push('c.slug = ?');
      params.push(category);
    } else {
      whereClauses.push('p.category_id = ?');
      params.push(Number(category));
    }
  }

  if (min_price) {
    whereClauses.push('COALESCE(p.discount_price, p.base_price) >= ?');
    params.push(Number(min_price));
  }

  if (max_price) {
    whereClauses.push('COALESCE(p.discount_price, p.base_price) <= ?');
    params.push(Number(max_price));
  }

  if (featured === 'true' || featured === '1') {
    whereClauses.push('p.is_featured = 1');
  }

  if (bestseller === 'true' || bestseller === '1') {
    whereClauses.push('p.is_bestseller = 1');
  }

  if (eggless === 'true' || eggless === '1') {
    whereClauses.push("(p.custom_attributes_schema LIKE '%eggless%' OR p.description LIKE '%eggless%')");
  }

  if (search && search.trim()) {
    whereClauses.push('(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  if (req.query.shop_id && req.query.shop_id !== 'all') {
    whereClauses.push('p.shop_id = ?');
    params.push(Number(req.query.shop_id));
  }

  let orderBy = 'p.is_bestseller DESC, p.id DESC';
  if (sort === 'price_asc') {
    orderBy = 'COALESCE(p.discount_price, p.base_price) ASC';
  } else if (sort === 'price_desc') {
    orderBy = 'COALESCE(p.discount_price, p.base_price) DESC';
  } else if (sort === 'newest') {
    orderBy = 'p.id DESC';
  } else if (sort === 'rating') {
    orderBy = 'avg_rating DESC';
  }

  const whereString = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

  const sql = `
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      s.name as shop_name,
      COALESCE(AVG(r.rating), 4.8) as avg_rating,
      COUNT(r.id) as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN shops s ON s.id = p.shop_id
    LEFT JOIN reviews r ON r.product_id = p.id
    ${whereString}
    GROUP BY p.id
    ORDER BY ${orderBy}
  `;

  const products = query(sql, params).map(p => ({
    ...p,
    images: JSON.parse(p.images_json || '[]'),
    custom_attributes_schema: JSON.parse(p.custom_attributes_schema || '{}'),
    avg_rating: Number(Number(p.avg_rating).toFixed(1)),
    discount_percentage: p.discount_price && p.base_price > p.discount_price
      ? Math.round(((p.base_price - p.discount_price) / p.base_price) * 100)
      : 0
  }));

  res.json({ success: true, count: products.length, products });
});

// Curated highlights for homepage
router.get('/featured/sections', (req, res) => {
  const bestsellers = query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, 4.9 as avg_rating, 24 as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1 AND p.is_bestseller = 1
    ORDER BY p.id DESC LIMIT 8
  `).map(p => ({
    ...p,
    images: JSON.parse(p.images_json || '[]'),
    custom_attributes_schema: JSON.parse(p.custom_attributes_schema || '{}'),
    discount_percentage: p.discount_price ? Math.round(((p.base_price - p.discount_price) / p.base_price) * 100) : 0
  }));

  const cakes = query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, 4.8 as avg_rating, 18 as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1 AND c.slug = 'cakes'
    ORDER BY p.id DESC LIMIT 8
  `).map(p => ({
    ...p,
    images: JSON.parse(p.images_json || '[]'),
    custom_attributes_schema: JSON.parse(p.custom_attributes_schema || '{}'),
    discount_percentage: p.discount_price ? Math.round(((p.base_price - p.discount_price) / p.base_price) * 100) : 0
  }));

  const flowers = query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, 4.9 as avg_rating, 32 as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1 AND c.slug = 'flowers'
    ORDER BY p.id DESC LIMIT 8
  `).map(p => ({
    ...p,
    images: JSON.parse(p.images_json || '[]'),
    custom_attributes_schema: JSON.parse(p.custom_attributes_schema || '{}'),
    discount_percentage: p.discount_price ? Math.round(((p.base_price - p.discount_price) / p.base_price) * 100) : 0
  }));

  const combos = query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, 5.0 as avg_rating, 15 as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1 AND (c.slug = 'gift-combos' OR c.slug = 'personalized-gifts' OR c.slug = 'gifts')
    ORDER BY p.id DESC LIMIT 8
  `).map(p => ({
    ...p,
    images: JSON.parse(p.images_json || '[]'),
    custom_attributes_schema: JSON.parse(p.custom_attributes_schema || '{}'),
    discount_percentage: p.discount_price ? Math.round(((p.base_price - p.discount_price) / p.base_price) * 100) : 0
  }));

  res.json({
    success: true,
    sections: {
      bestsellers,
      cakes,
      flowers,
      combos
    }
  });
});

// Single product by slug
router.get('/:slug', (req, res) => {
  const product = get(`
    SELECT 
      p.*,
      c.name as category_name,
      c.slug as category_slug,
      COALESCE(AVG(r.rating), 4.9) as avg_rating,
      COUNT(r.id) as review_count
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN reviews r ON r.product_id = p.id
    WHERE p.slug = ? OR p.id = ?
    GROUP BY p.id
  `, [req.params.slug, Number(req.params.slug) || -1]);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const variants = query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
  const reviews = query('SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC LIMIT 10', [product.id]);

  res.json({
    success: true,
    product: {
      ...product,
      images: JSON.parse(product.images_json || '[]'),
      custom_attributes_schema: JSON.parse(product.custom_attributes_schema || '{}'),
      avg_rating: Number(Number(product.avg_rating).toFixed(1)),
      discount_percentage: product.discount_price && product.base_price > product.discount_price
        ? Math.round(((product.base_price - product.discount_price) / product.base_price) * 100)
        : 0,
      variants,
      reviews
    }
  });
});

// Admin: Create product
router.post('/admin', requireAdmin, (req, res) => {
  const {
    shop_id,
    category_id,
    name,
    slug,
    description,
    short_desc,
    base_price,
    discount_price,
    stock_qty,
    low_stock_threshold,
    sku,
    is_active,
    is_featured,
    is_bestseller,
    images,
    custom_attributes_schema
  } = req.body;

  if (!category_id || !name || base_price === undefined) {
    return res.status(400).json({ success: false, message: 'Category, product name and base price are required' });
  }

  const generatedSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
  const generatedSku = sku || ('FB-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  try {
    const result = run(
      `INSERT INTO products (
        shop_id, category_id, name, slug, description, short_desc, base_price, discount_price,
        stock_qty, low_stock_threshold, sku, is_active, is_featured, is_bestseller,
        images_json, custom_attributes_schema
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shop_id ? Number(shop_id) : null,
        Number(category_id),
        name.trim(),
        generatedSlug,
        description || '',
        short_desc || '',
        Number(base_price),
        discount_price !== undefined && discount_price !== null && discount_price !== '' ? Number(discount_price) : null,
        stock_qty !== undefined ? Number(stock_qty) : 10,
        low_stock_threshold !== undefined ? Number(low_stock_threshold) : 5,
        generatedSku,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_featured ? 1 : 0,
        is_bestseller ? 1 : 0,
        JSON.stringify(Array.isArray(images) ? images : []),
        JSON.stringify(custom_attributes_schema || {})
      ]
    );

    const created = get('SELECT * FROM products WHERE id = ?', [Number(result.lastInsertRowid)]);
    res.status(201).json({
      success: true,
      message: 'Product created successfully and published',
      product: {
        ...created,
        images: JSON.parse(created.images_json || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating product: ' + err.message });
  }
});

// Admin: Update product
router.put('/admin/:id', requireAdmin, (req, res) => {
  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const {
    shop_id,
    category_id,
    name,
    slug,
    description,
    short_desc,
    base_price,
    discount_price,
    stock_qty,
    low_stock_threshold,
    sku,
    is_active,
    is_featured,
    is_bestseller,
    images,
    custom_attributes_schema
  } = req.body;

  try {
    run(
      `UPDATE products SET
        shop_id = ?,
        category_id = ?,
        name = ?,
        slug = ?,
        description = ?,
        short_desc = ?,
        base_price = ?,
        discount_price = ?,
        stock_qty = ?,
        low_stock_threshold = ?,
        sku = ?,
        is_active = ?,
        is_featured = ?,
        is_bestseller = ?,
        images_json = ?,
        custom_attributes_schema = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        shop_id !== undefined ? (shop_id ? Number(shop_id) : null) : product.shop_id,
        category_id !== undefined ? Number(category_id) : product.category_id,
        name !== undefined ? name.trim() : product.name,
        slug !== undefined ? slug.trim() : product.slug,
        description !== undefined ? description : product.description,
        short_desc !== undefined ? short_desc : product.short_desc,
        base_price !== undefined ? Number(base_price) : product.base_price,
        discount_price !== undefined && discount_price !== null && discount_price !== '' ? Number(discount_price) : null,
        stock_qty !== undefined ? Number(stock_qty) : product.stock_qty,
        low_stock_threshold !== undefined ? Number(low_stock_threshold) : product.low_stock_threshold,
        sku !== undefined ? sku.trim() : product.sku,
        is_active !== undefined ? (is_active ? 1 : 0) : product.is_active,
        is_featured !== undefined ? (is_featured ? 1 : 0) : product.is_featured,
        is_bestseller !== undefined ? (is_bestseller ? 1 : 0) : product.is_bestseller,
        images !== undefined ? JSON.stringify(images) : product.images_json,
        custom_attributes_schema !== undefined ? JSON.stringify(custom_attributes_schema) : product.custom_attributes_schema,
        req.params.id
      ]
    );

    const updated = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: {
        ...updated,
        images: JSON.parse(updated.images_json || '[]')
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating product: ' + err.message });
  }
});

// Admin: Quick toggle product status (active/inactive, featured, bestseller)
router.patch('/admin/:id/toggle', requireAdmin, (req, res) => {
  const { field } = req.body; // 'is_active', 'is_featured', 'is_bestseller'
  if (!['is_active', 'is_featured', 'is_bestseller'].includes(field)) {
    return res.status(400).json({ success: false, message: 'Invalid toggle field' });
  }

  const product = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const newValue = product[field] ? 0 : 1;
  run(`UPDATE products SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newValue, req.params.id]);

  res.json({
    success: true,
    message: `${field} updated to ${newValue === 1 ? 'enabled' : 'disabled'}`,
    field,
    value: newValue
  });
});

// Admin: Delete product
router.delete('/admin/:id', requireAdmin, (req, res) => {
  try {
    run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting product: ' + err.message });
  }
});

module.exports = router;
