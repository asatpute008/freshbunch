const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query, get, run } = require('../db');
const { generateToken, requireAuth } = require('../middleware/auth');

// Admin Login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = get('SELECT * FROM users WHERE email = ? AND role = ?', [email.trim().toLowerCase(), 'admin']);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials or account inactive' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Admin authentication successful',
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    }
  });
});

// Customer Register
router.post('/customer/register', (req, res) => {
  const { full_name, email, phone, password } = req.body;
  if (!full_name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email and password are required' });
  }

  const existing = get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  try {
    const result = run(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, 'customer', 'active')`,
      [full_name.trim(), email.trim().toLowerCase(), phone || '', password_hash]
    );

    const user = {
      id: Number(result.lastInsertRowid),
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      role: 'customer'
    };

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error creating customer: ' + err.message });
  }
});

// Customer Login
router.post('/customer/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!user || user.status !== 'active') {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Welcome back, ' + user.full_name,
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// Get current user profile
router.get('/me', requireAuth, (req, res) => {
  const user = get('SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, user });
});

// Update profile
router.put('/profile', requireAuth, (req, res) => {
  const { full_name, phone, current_password, new_password } = req.body;
  const user = get('SELECT * FROM users WHERE id = ?', [req.user.id]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  let newHash = user.password_hash;
  if (new_password) {
    if (!current_password || !bcrypt.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    newHash = bcrypt.hashSync(new_password, 10);
  }

  run(
    `UPDATE users SET full_name = ?, phone = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [full_name || user.full_name, phone || user.phone, newHash, user.id]
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user.id,
      full_name: full_name || user.full_name,
      email: user.email,
      phone: phone || user.phone,
      role: user.role
    }
  });
});

// Customer saved addresses
router.get('/addresses', requireAuth, (req, res) => {
  const addresses = query('SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.user.id]);
  res.json({ success: true, addresses });
});

router.post('/addresses', requireAuth, (req, res) => {
  const { recipient_name, phone, street_address, city, pincode, is_default } = req.body;
  if (!recipient_name || !phone || !street_address || !city || !pincode) {
    return res.status(400).json({ success: false, message: 'All address fields are required' });
  }

  if (is_default) {
    run('UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
  }

  const result = run(
    `INSERT INTO customer_addresses (user_id, recipient_name, phone, street_address, city, pincode, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, recipient_name, phone, street_address, city, pincode, is_default ? 1 : 0]
  );

  res.status(201).json({ success: true, message: 'Address added', addressId: Number(result.lastInsertRowid) });
});

router.delete('/addresses/:id', requireAuth, (req, res) => {
  run('DELETE FROM customer_addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true, message: 'Address removed' });
});

module.exports = router;
