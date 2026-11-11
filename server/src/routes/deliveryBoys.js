const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// All delivery boy routes require Admin authorization
router.use(requireAdmin);

// 1. List all registered delivery personnel with active orders count
router.get('/', (req, res) => {
  try {
    const boys = query(`
      SELECT 
        d.*,
        COUNT(DISTINCT CASE WHEN o.order_status IN ('confirm', 'ready', 'dispatched', 'confirmed', 'preparing', 'out_for_delivery') THEN o.id END) as active_deliveries_count,
        COUNT(DISTINCT CASE WHEN o.order_status IN ('closed', 'delivered') THEN o.id END) as total_completed_count
      FROM delivery_boys d
      LEFT JOIN orders o ON o.delivery_boy_id = d.id
      GROUP BY d.id
      ORDER BY d.id DESC
    `);

    res.json({ success: true, count: boys.length, deliveryBoys: boys });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Register new delivery boy
router.post('/', (req, res) => {
  try {
    const { name, phone, email, vehicle_type, vehicle_number, city, service_zone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and Phone number are required' });
    }

    const cleanPhone = phone.trim();
    const existing = get('SELECT id FROM delivery_boys WHERE phone = ?', [cleanPhone]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A delivery boy with this phone number is already registered' });
    }

    const result = run(`
      INSERT INTO delivery_boys (
        name, phone, email, vehicle_type, vehicle_number, city, service_zone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      name.trim(),
      cleanPhone,
      email || '',
      vehicle_type || 'bike',
      vehicle_number ? vehicle_number.toUpperCase().trim() : '',
      city || 'Bangalore',
      service_zone || 'Central & East Zones'
    ]);

    const created = get('SELECT * FROM delivery_boys WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: `Delivery boy "${name}" registered successfully`,
      deliveryBoy: created
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Update delivery boy profile or status
router.put('/:id', (req, res) => {
  try {
    const { name, phone, email, vehicle_type, vehicle_number, city, service_zone, status } = req.body;

    const boy = get('SELECT id FROM delivery_boys WHERE id = ?', [req.params.id]);
    if (!boy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found' });
    }

    run(`
      UPDATE delivery_boys SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        vehicle_type = COALESCE(?, vehicle_type),
        vehicle_number = COALESCE(?, vehicle_number),
        city = COALESCE(?, city),
        service_zone = COALESCE(?, service_zone),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [
      name || null,
      phone || null,
      email !== undefined ? email : null,
      vehicle_type || null,
      vehicle_number || null,
      city || null,
      service_zone || null,
      status || null,
      boy.id
    ]);

    const updated = get('SELECT * FROM delivery_boys WHERE id = ?', [boy.id]);
    res.json({ success: true, message: 'Delivery boy updated successfully', deliveryBoy: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Delete delivery boy
router.delete('/:id', (req, res) => {
  try {
    const boy = get('SELECT id FROM delivery_boys WHERE id = ?', [req.params.id]);
    if (!boy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found' });
    }

    // Unassign from orders
    run('UPDATE orders SET delivery_boy_id = NULL WHERE delivery_boy_id = ?', [boy.id]);
    run('DELETE FROM delivery_boys WHERE id = ?', [boy.id]);

    res.json({ success: true, message: 'Delivery boy removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
