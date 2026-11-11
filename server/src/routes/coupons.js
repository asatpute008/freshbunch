const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Public: Validate promo coupon
router.post('/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = get('SELECT * FROM coupons WHERE UPPER(code) = ?', [cleanCode]);

  if (!coupon || !coupon.is_active) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (coupon.start_date && coupon.start_date > today) {
    return res.status(400).json({ success: false, message: 'Coupon offer has not started yet' });
  }
  if (coupon.expiry_date && coupon.expiry_date < today) {
    return res.status(400).json({ success: false, message: 'This coupon has expired' });
  }

  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (coupon.min_order_value && orderSubtotal < coupon.min_order_value) {
    return res.status(400).json({
      success: false,
      message: `Minimum order value of ₹${coupon.min_order_value} required for this coupon`
    });
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (orderSubtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount;
    }
  } else {
    // Fixed amount
    discountAmount = Math.min(coupon.discount_value, orderSubtotal);
  }

  discountAmount = Math.round(discountAmount * 100) / 100;

  res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied! You saved ₹${discountAmount}`,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount
    }
  });
});

// Admin: Get all coupons
router.get('/admin', requireAdmin, (req, res) => {
  const coupons = query('SELECT * FROM coupons ORDER BY id DESC');
  res.json({ success: true, coupons });
});

// Admin: Create coupon
router.post('/admin', requireAdmin, (req, res) => {
  const {
    code,
    description,
    discount_type,
    discount_value,
    min_order_value,
    max_discount_amount,
    start_date,
    expiry_date,
    usage_limit,
    is_active
  } = req.body;

  if (!code || !discount_value) {
    return res.status(400).json({ success: false, message: 'Coupon code and discount value are required' });
  }

  const cleanCode = code.trim().toUpperCase();
  const existing = get('SELECT id FROM coupons WHERE UPPER(code) = ?', [cleanCode]);
  if (existing) {
    return res.status(409).json({ success: false, message: 'A coupon with this code already exists' });
  }

  try {
    const result = run(
      `INSERT INTO coupons (
        code, description, discount_type, discount_value, min_order_value,
        max_discount_amount, start_date, expiry_date, usage_limit, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanCode,
        description || '',
        discount_type || 'percentage',
        Number(discount_value),
        Number(min_order_value) || 0,
        max_discount_amount ? Number(max_discount_amount) : null,
        start_date || null,
        expiry_date || null,
        usage_limit ? Number(usage_limit) : 1000,
        is_active !== false && is_active !== 0 ? 1 : 0
      ]
    );

    const created = get('SELECT * FROM coupons WHERE id = ?', [Number(result.lastInsertRowid)]);
    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating coupon: ' + err.message });
  }
});

// Admin: Update coupon
router.put('/admin/:id', requireAdmin, (req, res) => {
  const coupon = get('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Coupon not found' });
  }

  const {
    code,
    description,
    discount_type,
    discount_value,
    min_order_value,
    max_discount_amount,
    start_date,
    expiry_date,
    usage_limit,
    is_active
  } = req.body;

  try {
    run(
      `UPDATE coupons SET
        code = ?,
        description = ?,
        discount_type = ?,
        discount_value = ?,
        min_order_value = ?,
        max_discount_amount = ?,
        start_date = ?,
        expiry_date = ?,
        usage_limit = ?,
        is_active = ?
      WHERE id = ?`,
      [
        code ? code.trim().toUpperCase() : coupon.code,
        description !== undefined ? description : coupon.description,
        discount_type || coupon.discount_type,
        discount_value !== undefined ? Number(discount_value) : coupon.discount_value,
        min_order_value !== undefined ? Number(min_order_value) : coupon.min_order_value,
        max_discount_amount !== undefined ? (max_discount_amount ? Number(max_discount_amount) : null) : coupon.max_discount_amount,
        start_date !== undefined ? start_date : coupon.start_date,
        expiry_date !== undefined ? expiry_date : coupon.expiry_date,
        usage_limit !== undefined ? Number(usage_limit) : coupon.usage_limit,
        is_active !== undefined ? (is_active ? 1 : 0) : coupon.is_active,
        req.params.id
      ]
    );

    const updated = get('SELECT * FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Coupon updated successfully', coupon: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating coupon: ' + err.message });
  }
});

// Admin: Delete coupon
router.delete('/admin/:id', requireAdmin, (req, res) => {
  run('DELETE FROM coupons WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Coupon deleted successfully' });
});

module.exports = router;
