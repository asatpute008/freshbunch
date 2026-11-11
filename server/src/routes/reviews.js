const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin, optionalAuth } = require('../middleware/auth');

// 1. Admin: Fetch all customer reviews with product info & rating stats
router.get('/admin', requireAdmin, (req, res) => {
  try {
    const { rating, search } = req.query;
    let sql = `
      SELECT 
        r.*,
        p.name as product_name,
        p.slug as product_slug,
        p.images_json as product_images,
        u.email as customer_email,
        u.phone as customer_phone
      FROM reviews r
      LEFT JOIN products p ON p.id = r.product_id
      LEFT JOIN users u ON u.id = r.user_id
      WHERE 1=1
    `;
    const params = [];

    if (rating && rating !== 'all') {
      if (rating === 'low') {
        sql += ' AND r.rating <= 2';
      } else {
        sql += ' AND r.rating = ?';
        params.push(Number(rating));
      }
    }

    if (search && search.trim()) {
      sql += ' AND (r.customer_name LIKE ? OR r.comment LIKE ? OR p.name LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY r.id DESC LIMIT 100';

    const rawReviews = query(sql, params);
    const reviews = rawReviews.map(r => ({
      ...r,
      product_images: JSON.parse(r.product_images || '[]')
    }));

    // Calculate rating statistics
    const statsRow = get(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(AVG(rating), 5) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as count_5,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as count_4,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as count_3,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as count_2,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as count_1
      FROM reviews
    `);

    res.json({
      success: true,
      reviews,
      stats: {
        totalReviews: statsRow?.total_count || 0,
        avgRating: Number((statsRow?.avg_rating || 5).toFixed(1)),
        breakdown: {
          5: statsRow?.count_5 || 0,
          4: statsRow?.count_4 || 0,
          3: statsRow?.count_3 || 0,
          2: statsRow?.count_2 || 0,
          1: statsRow?.count_1 || 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Admin: Delete / Moderate a review
router.delete('/admin/:id', requireAdmin, (req, res) => {
  try {
    const rev = get('SELECT id FROM reviews WHERE id = ?', [req.params.id]);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Admin: Toggle verified purchase badge
router.patch('/admin/:id/toggle-verify', requireAdmin, (req, res) => {
  try {
    const rev = get('SELECT id, is_verified_purchase FROM reviews WHERE id = ?', [req.params.id]);
    if (!rev) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    const nextVal = rev.is_verified_purchase === 1 ? 0 : 1;
    run('UPDATE reviews SET is_verified_purchase = ? WHERE id = ?', [nextVal, req.params.id]);
    res.json({ success: true, is_verified_purchase: nextVal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Public: Fetch reviews for a specific product
router.get('/:productId', (req, res) => {
  try {
    const reviews = query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY id DESC LIMIT 20',
      [req.params.productId]
    );
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Public: Post a review
router.post('/', optionalAuth, (req, res) => {
  const { product_id, customer_name, rating, comment } = req.body;
  if (!product_id || !rating || !comment) {
    return res.status(400).json({ success: false, message: 'Product, rating, and comment are required' });
  }

  const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
  const userId = req.user ? req.user.id : null;
  const name = customer_name || (req.user ? req.user.full_name : 'Verified Customer');

  run(
    `INSERT INTO reviews (product_id, user_id, customer_name, rating, comment, is_verified_purchase)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [Number(product_id), userId, name.trim(), numRating, comment.trim()]
  );

  res.status(201).json({ success: true, message: 'Thank you for your review!' });
});

module.exports = router;
