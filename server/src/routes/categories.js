const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Public: Get all active categories with product counts
router.get('/', (req, res) => {
  const includeAll = req.query.all === 'true';
  const sql = `
    SELECT c.*, COUNT(p.id) as product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
    ${includeAll ? '' : 'WHERE c.is_active = 1'}
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `;
  const categories = query(sql);
  res.json({ success: true, categories });
});

// Public: Get category by slug
router.get('/:slug', (req, res) => {
  const category = get('SELECT * FROM categories WHERE slug = ?', [req.params.slug]);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }
  res.json({ success: true, category });
});

// Admin: Create category
router.post('/admin', requireAdmin, (req, res) => {
  const { name, slug, description, image_url, sort_order, is_active } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const generatedSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  const existing = get('SELECT id FROM categories WHERE slug = ?', [generatedSlug]);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Category with this slug already exists' });
  }

  try {
    const result = run(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), generatedSlug, description || '', image_url || '', Number(sort_order) || 0, is_active !== false && is_active !== 0 ? 1 : 0]
    );

    const created = get('SELECT * FROM categories WHERE id = ?', [Number(result.lastInsertRowid)]);
    res.status(201).json({ success: true, message: 'Category created successfully', category: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating category: ' + err.message });
  }
});

// Admin: Update category
router.put('/admin/:id', requireAdmin, (req, res) => {
  const { name, slug, description, image_url, sort_order, is_active } = req.body;
  const category = get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  if (!category) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const generatedSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : category.slug;

  try {
    run(
      `UPDATE categories
       SET name = ?, slug = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        name || category.name,
        generatedSlug,
        description !== undefined ? description : category.description,
        image_url !== undefined ? image_url : category.image_url,
        sort_order !== undefined ? Number(sort_order) : category.sort_order,
        is_active !== undefined ? (is_active ? 1 : 0) : category.is_active,
        req.params.id
      ]
    );

    const updated = get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category updated successfully', category: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating category: ' + err.message });
  }
});

// Admin: Delete category
router.delete('/admin/:id', requireAdmin, (req, res) => {
  const productCount = get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [req.params.id]);
  if (productCount && productCount.count > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category: contains ${productCount.count} product(s). Please reassign or delete them first.`
    });
  }

  run('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Category deleted successfully' });
});

module.exports = router;
