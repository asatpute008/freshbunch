const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Public: Check delivery pincode serviceability
router.get('/check-pincode/:pincode', (req, res) => {
  const pincode = req.params.pincode.trim();
  const zone = get('SELECT * FROM delivery_pincodes WHERE pincode = ? AND is_active = 1', [pincode]);

  if (!zone) {
    return res.json({
      success: false,
      serviceable: false,
      message: `Pincode ${pincode} is currently not in our direct delivery zone. Please try another pincode.`
    });
  }

  res.json({
    success: true,
    serviceable: true,
    pincode: zone.pincode,
    area_name: zone.area_name,
    city: zone.city,
    delivery_charge: zone.delivery_charge,
    min_free_delivery_amount: zone.min_free_delivery_amount,
    same_day_cutoff_time: zone.same_day_cutoff_time,
    message: `Delivery available in ${zone.area_name}, ${zone.city}! Free delivery on orders above ₹${zone.min_free_delivery_amount}.`
  });
});

// Public: Get delivery slots for a chosen delivery date
router.get('/slots', (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  const slots = query('SELECT * FROM delivery_slots WHERE is_active = 1 ORDER BY start_time ASC');

  // If date is today, check same-day eligibility
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = date === todayStr;

  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  const evaluatedSlots = slots.map(slot => {
    let available = true;
    let reason = '';

    if (isToday) {
      const [startH, startM] = slot.start_time.split(':').map(Number);
      const slotStartTimeVal = startH * 60 + (startM || 0);

      // Must order at least 2 hours before slot start time
      if (currentTimeVal + 120 > slotStartTimeVal) {
        available = false;
        reason = 'Slot closed for today (order cutoff reached)';
      }
    }

    return {
      ...slot,
      available,
      reason
    };
  });

  res.json({
    success: true,
    is_today: isToday,
    slots: evaluatedSlots
  });
});

// Admin: Get all delivery pincodes
router.get('/admin/pincodes', requireAdmin, (req, res) => {
  const pincodes = query('SELECT * FROM delivery_pincodes ORDER BY city ASC, pincode ASC');
  res.json({ success: true, pincodes });
});

// Admin: Add delivery pincode
router.post('/admin/pincodes', requireAdmin, (req, res) => {
  const { pincode, area_name, city, delivery_charge, min_free_delivery_amount, same_day_cutoff_time, is_active } = req.body;
  if (!pincode || !area_name || !city) {
    return res.status(400).json({ success: false, message: 'Pincode, area name and city are required' });
  }

  const existing = get('SELECT id FROM delivery_pincodes WHERE pincode = ?', [pincode.trim()]);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Pincode already exists in delivery rules' });
  }

  try {
    const result = run(
      `INSERT INTO delivery_pincodes (
        pincode, area_name, city, delivery_charge, min_free_delivery_amount, same_day_cutoff_time, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        pincode.trim(),
        area_name.trim(),
        city.trim(),
        Number(delivery_charge) || 0,
        Number(min_free_delivery_amount) || 500,
        same_day_cutoff_time || '17:00',
        is_active !== false && is_active !== 0 ? 1 : 0
      ]
    );

    const created = get('SELECT * FROM delivery_pincodes WHERE id = ?', [Number(result.lastInsertRowid)]);
    res.status(201).json({ success: true, message: 'Pincode added successfully', pincode: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding pincode: ' + err.message });
  }
});

// Admin: Update delivery pincode
router.put('/admin/pincodes/:id', requireAdmin, (req, res) => {
  const zone = get('SELECT * FROM delivery_pincodes WHERE id = ?', [req.params.id]);
  if (!zone) {
    return res.status(404).json({ success: false, message: 'Delivery pincode entry not found' });
  }

  const { pincode, area_name, city, delivery_charge, min_free_delivery_amount, same_day_cutoff_time, is_active } = req.body;

  try {
    run(
      `UPDATE delivery_pincodes SET
        pincode = ?,
        area_name = ?,
        city = ?,
        delivery_charge = ?,
        min_free_delivery_amount = ?,
        same_day_cutoff_time = ?,
        is_active = ?
      WHERE id = ?`,
      [
        pincode ? pincode.trim() : zone.pincode,
        area_name ? area_name.trim() : zone.area_name,
        city ? city.trim() : zone.city,
        delivery_charge !== undefined ? Number(delivery_charge) : zone.delivery_charge,
        min_free_delivery_amount !== undefined ? Number(min_free_delivery_amount) : zone.min_free_delivery_amount,
        same_day_cutoff_time || zone.same_day_cutoff_time,
        is_active !== undefined ? (is_active ? 1 : 0) : zone.is_active,
        req.params.id
      ]
    );

    const updated = get('SELECT * FROM delivery_pincodes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Delivery pincode updated', pincode: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating pincode: ' + err.message });
  }
});

// Admin: Delete delivery pincode
router.delete('/admin/pincodes/:id', requireAdmin, (req, res) => {
  run('DELETE FROM delivery_pincodes WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Pincode removed from delivery list' });
});

// Admin: Get all delivery slots
router.get('/admin/slots', requireAdmin, (req, res) => {
  const slots = query('SELECT * FROM delivery_slots ORDER BY start_time ASC');
  res.json({ success: true, slots });
});

// Admin: Add delivery slot
router.post('/admin/slots', requireAdmin, (req, res) => {
  const { slot_name, start_time, end_time, slot_charge, max_orders_per_slot, is_active } = req.body;
  if (!slot_name || !start_time || !end_time) {
    return res.status(400).json({ success: false, message: 'Slot name, start time and end time are required' });
  }

  try {
    const result = run(
      `INSERT INTO delivery_slots (slot_name, start_time, end_time, slot_charge, max_orders_per_slot, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        slot_name.trim(),
        start_time.trim(),
        end_time.trim(),
        Number(slot_charge) || 0,
        Number(max_orders_per_slot) || 50,
        is_active !== false && is_active !== 0 ? 1 : 0
      ]
    );
    const created = get('SELECT * FROM delivery_slots WHERE id = ?', [Number(result.lastInsertRowid)]);
    res.status(201).json({ success: true, message: 'Slot created successfully', slot: created });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating slot: ' + err.message });
  }
});

// Admin: Update delivery slot
router.put('/admin/slots/:id', requireAdmin, (req, res) => {
  const { slot_name, start_time, end_time, slot_charge, max_orders_per_slot, is_active } = req.body;
  const slot = get('SELECT * FROM delivery_slots WHERE id = ?', [req.params.id]);
  if (!slot) {
    return res.status(404).json({ success: false, message: 'Slot not found' });
  }

  try {
    run(
      `UPDATE delivery_slots SET
        slot_name = ?,
        start_time = ?,
        end_time = ?,
        slot_charge = ?,
        max_orders_per_slot = ?,
        is_active = ?
       WHERE id = ?`,
      [
        slot_name ? slot_name.trim() : slot.slot_name,
        start_time || slot.start_time,
        end_time || slot.end_time,
        slot_charge !== undefined ? Number(slot_charge) : slot.slot_charge,
        max_orders_per_slot !== undefined ? Number(max_orders_per_slot) : slot.max_orders_per_slot,
        is_active !== undefined ? (is_active ? 1 : 0) : slot.is_active,
        req.params.id
      ]
    );
    const updated = get('SELECT * FROM delivery_slots WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Slot updated', slot: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating slot: ' + err.message });
  }
});

module.exports = router;
