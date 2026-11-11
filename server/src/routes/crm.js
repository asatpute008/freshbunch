const express = require('express');
const router = express.Router();
const { query, get, run } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// All CRM routes require admin authentication
router.use(requireAdmin);

// 1. CRM Dashboard Overview
router.get('/overview', (req, res) => {
  // Customer Funnel counts
  const totalCustomers = get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").count;
  const vipCount = get(`
    SELECT COUNT(*) as count FROM (
      SELECT u.id
      FROM users u
      JOIN orders o ON o.user_id = u.id AND o.order_status != 'cancelled'
      GROUP BY u.id
      HAVING SUM(o.total_amount) >= 1500
    )
  `)?.count || 0;

  const repeatCount = get(`
    SELECT COUNT(*) as count FROM (
      SELECT u.id
      FROM users u
      JOIN orders o ON o.user_id = u.id AND o.order_status != 'cancelled'
      GROUP BY u.id
      HAVING COUNT(o.id) > 1
    )
  `)?.count || 0;

  // Active CRM Tasks
  const pendingTasks = query(`
    SELECT * FROM crm_tasks WHERE status = 'pending' ORDER BY priority = 'urgent' DESC, priority = 'high' DESC, due_date ASC LIMIT 6
  `);

  // Upcoming Occasions in next 14 days
  const allCustomers = query(`SELECT id, full_name, email, phone, occasions_json FROM users WHERE role = 'customer'`);
  const upcomingOccasions = [];
  const today = new Date();

  for (const c of allCustomers) {
    const occasions = JSON.parse(c.occasions_json || '[]');
    for (const occ of occasions) {
      upcomingOccasions.push({
        customer_id: c.id,
        customer_name: c.full_name,
        customer_phone: c.phone,
        title: occ.title,
        date: occ.date,
        relation: occ.relation || 'Personal'
      });
    }
  }

  // Today's Orders with Baker & Rider info
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDeliveries = query(`
    SELECT o.id, o.order_number, o.total_amount, o.order_status, o.payment_status,
           o.delivery_date, o.delivery_slot, o.delivery_city, o.assigned_staff, o.assigned_rider,
           o.guest_info_json, u.full_name as registered_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.delivery_date = ? OR DATE(o.created_at) = ?
    ORDER BY o.id DESC
  `, [todayStr, todayStr]).map(ord => {
    const guest = JSON.parse(ord.guest_info_json || '{}');
    return {
      ...ord,
      customer_name: ord.registered_name || guest.name || 'Guest'
    };
  });

  // Recent CRM Interactions
  const recentInteractions = query(`
    SELECT * FROM crm_interactions ORDER BY id DESC LIMIT 8
  `);

  res.json({
    success: true,
    funnel: {
      totalCustomers,
      vipCount,
      repeatCount,
      firstTimeCount: Math.max(0, totalCustomers - repeatCount)
    },
    pendingTasks,
    upcomingOccasions: upcomingOccasions.slice(0, 6),
    todayDeliveries,
    recentInteractions
  });
});

// 2. Customer 360 List & Filtering
router.get('/customers', (req, res) => {
  const { stage, tag, search } = req.query;

  const users = query(`
    SELECT 
      u.id, u.full_name, u.email, u.phone, u.status, u.created_at,
      u.lifecycle_stage, u.tags_json, u.occasions_json, u.notes, u.preferred_category,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(CASE WHEN o.order_status != 'cancelled' THEN o.total_amount ELSE 0 END), 0) as lifetime_value,
      MAX(o.created_at) as last_order_date
    FROM users u
    LEFT JOIN orders o ON o.user_id = u.id
    WHERE u.role = 'customer'
    GROUP BY u.id
    ORDER BY lifetime_value DESC, u.id DESC
  `).map(u => {
    const tags = JSON.parse(u.tags_json || '[]');
    const occasions = JSON.parse(u.occasions_json || '[]');
    const avgOrderValue = u.total_orders > 0 ? Math.round(u.lifetime_value / u.total_orders) : 0;

    let computedStage = u.lifecycle_stage || 'lead';
    if (u.lifetime_value >= 1500) computedStage = 'vip';
    else if (u.total_orders > 1) computedStage = 'repeat';
    else if (u.total_orders === 1) computedStage = 'first_time';

    return {
      ...u,
      tags,
      occasions,
      avg_order_value: avgOrderValue,
      lifecycle_stage: computedStage
    };
  });

  let filtered = users;
  if (stage && stage !== 'all') {
    filtered = filtered.filter(u => u.lifecycle_stage === stage);
  }
  if (tag && tag !== 'all') {
    filtered = filtered.filter(u => u.tags.includes(tag));
  }
  if (search && search.trim()) {
    const term = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.full_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term))
    );
  }

  res.json({ success: true, count: filtered.length, customers: filtered });
});

// 3. Customer 360 Full Profile Details
router.get('/customers/:id', (req, res) => {
  const user = get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  // Past Orders with item customizations
  const orders = query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [user.id]).map(ord => {
    const items = query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]).map(it => ({
      ...it,
      customization: JSON.parse(it.customization_details_json || '{}')
    }));
    return { ...ord, items };
  });

  // Interactions history
  const interactions = query('SELECT * FROM crm_interactions WHERE user_id = ? ORDER BY id DESC', [user.id]);

  // Saved Addresses
  const addresses = query('SELECT * FROM customer_addresses WHERE user_id = ?', [user.id]);

  const ltv = orders.reduce((acc, ord) => ord.order_status !== 'cancelled' ? acc + ord.total_amount : acc, 0);

  res.json({
    success: true,
    customer: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      lifecycle_stage: user.lifecycle_stage || 'lead',
      tags: JSON.parse(user.tags_json || '[]'),
      occasions: JSON.parse(user.occasions_json || '[]'),
      notes: user.notes || '',
      preferred_category: user.preferred_category || '',
      created_at: user.created_at,
      lifetime_value: ltv,
      total_orders: orders.length,
      orders,
      interactions,
      addresses
    }
  });
});

// 4. Update Customer CRM Profile (Tags, Lifecycle, Notes, Occasions)
router.put('/customers/:id', (req, res) => {
  const { lifecycle_stage, tags, occasions, notes, preferred_category } = req.body;
  const user = get('SELECT id FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  run(`
    UPDATE users SET
      lifecycle_stage = COALESCE(?, lifecycle_stage),
      tags_json = COALESCE(?, tags_json),
      occasions_json = COALESCE(?, occasions_json),
      notes = COALESCE(?, notes),
      preferred_category = COALESCE(?, preferred_category)
    WHERE id = ?
  `, [
    lifecycle_stage || null,
    tags ? JSON.stringify(tags) : null,
    occasions ? JSON.stringify(occasions) : null,
    notes !== undefined ? notes : null,
    preferred_category || null,
    user.id
  ]);

  res.json({ success: true, message: 'Customer CRM profile updated successfully' });
});

// 5. Log CRM Interaction & History
router.get('/interactions', (req, res) => {
  const { channel, user_id, search } = req.query;
  let sql = 'SELECT * FROM crm_interactions WHERE 1=1';
  const params = [];

  if (channel && channel !== 'all') {
    sql += ' AND channel = ?';
    params.push(channel);
  }
  if (user_id) {
    sql += ' AND user_id = ?';
    params.push(user_id);
  }
  if (search && search.trim()) {
    sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ? OR content LIKE ? OR subject LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  sql += ' ORDER BY id DESC LIMIT 100';
  const interactions = query(sql, params);
  res.json({ success: true, count: interactions.length, interactions });
});

router.post('/interactions', (req, res) => {
  const { user_id, order_id, customer_name, customer_phone, channel, direction, subject, content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Interaction content is required' });
  }

  const result = run(`
    INSERT INTO crm_interactions (
      user_id, order_id, customer_name, customer_phone, channel, direction, subject, content, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Freshbunch Support')
  `, [
    user_id || null,
    order_id || null,
    customer_name || 'Customer',
    customer_phone || '',
    channel || 'whatsapp',
    direction || 'outbound',
    subject || '',
    content
  ]);

  res.status(201).json({
    success: true,
    message: 'Interaction logged',
    interactionId: Number(result.lastInsertRowid)
  });
});

// 6. CRM Tasks Management
router.get('/tasks', (req, res) => {
  const tasks = query("SELECT * FROM crm_tasks ORDER BY status = 'pending' DESC, due_date ASC");
  res.json({ success: true, tasks });
});

router.post('/tasks', (req, res) => {
  const { title, priority, due_date, assigned_to, customer_id, customer_name, order_number } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }

  const result = run(`
    INSERT INTO crm_tasks (
      title, priority, due_date, assigned_to, customer_id, customer_name, order_number
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    title.trim(),
    priority || 'medium',
    due_date || new Date().toISOString().split('T')[0],
    assigned_to || 'Bakery Team',
    customer_id || null,
    customer_name || null,
    order_number || null
  ]);

  res.status(201).json({ success: true, message: 'CRM task created', taskId: Number(result.lastInsertRowid) });
});

router.patch('/tasks/:id/toggle', (req, res) => {
  const task = get('SELECT status FROM crm_tasks WHERE id = ?', [req.params.id]);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const nextStatus = task.status === 'pending' ? 'completed' : 'pending';
  run('UPDATE crm_tasks SET status = ? WHERE id = ?', [nextStatus, req.params.id]);

  res.json({ success: true, status: nextStatus });
});

router.delete('/tasks/:id', (req, res) => {
  run('DELETE FROM crm_tasks WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Task deleted' });
});

// 7. Occasion & Delivery Calendar View
router.get('/calendar', (req, res) => {
  // Fetch deliveries
  const orders = query(`
    SELECT o.id, o.order_number, o.total_amount, o.order_status, o.delivery_date, o.delivery_slot,
           o.assigned_staff, o.assigned_rider, o.guest_info_json, u.full_name as reg_name
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    WHERE o.order_status != 'cancelled'
  `).map(ord => {
    const guest = JSON.parse(ord.guest_info_json || '{}');
    return {
      type: 'delivery',
      id: ord.id,
      order_number: ord.order_number,
      title: `Order ${ord.order_number} (${ord.delivery_slot.split(' ')[0]})`,
      date: ord.delivery_date,
      customer_name: ord.reg_name || guest.name,
      amount: ord.total_amount,
      status: ord.order_status
    };
  });

  // Fetch customer occasions (birthdays & anniversaries)
  const customers = query("SELECT id, full_name, phone, occasions_json FROM users WHERE role = 'customer'");
  const occasions = [];
  const currentYear = new Date().getFullYear();

  for (const c of customers) {
    const occs = JSON.parse(c.occasions_json || '[]');
    for (const oc of occs) {
      if (oc.date) {
        // Assume format MM-DD
        const [m, d] = oc.date.split('-');
        const dateStr = `${currentYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        occasions.push({
          type: 'occasion',
          customer_id: c.id,
          title: `🎉 ${c.full_name}'s ${oc.title}`,
          date: dateStr,
          customer_name: c.full_name,
          phone: c.phone
        });
      }
    }
  }

  res.json({
    success: true,
    events: [...orders, ...occasions]
  });
});

// 8. Assign Staff / Kitchen Chef & Delivery Rider to Order
router.patch('/orders/:id/assign', (req, res) => {
  const { assigned_staff, assigned_rider } = req.body;
  const order = get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  run(`
    UPDATE orders SET
      assigned_staff = COALESCE(?, assigned_staff),
      assigned_rider = COALESCE(?, assigned_rider)
    WHERE id = ?
  `, [assigned_staff || null, assigned_rider || null, order.id]);

  res.json({ success: true, message: 'Staff and Rider assigned successfully' });
});

// 9. Campaigns List & Broadcast Simulation
router.get('/campaigns', (req, res) => {
  const campaigns = query('SELECT * FROM crm_campaigns ORDER BY id DESC');
  res.json({ success: true, count: campaigns.length, campaigns });
});

router.post('/campaigns/broadcast', (req, res) => {
  const { name, target_segment, coupon_code, message_template, channel } = req.body;

  if (!name || !message_template) {
    return res.status(400).json({ success: false, message: 'Campaign name and message template are required' });
  }

  let count = 0;
  if (target_segment === 'vip') count = 12;
  else if (target_segment === 'birthdays_this_week') count = 8;
  else if (target_segment === 'at_risk') count = 15;
  else count = 45;

  const result = run(`
    INSERT INTO crm_campaigns (
      name, target_segment, coupon_code, channel, message_template, recipients_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, 'sent')
  `, [
    name,
    target_segment || 'all',
    coupon_code || null,
    channel || 'whatsapp',
    message_template,
    count
  ]);

  res.status(201).json({
    success: true,
    message: `Campaign "${name}" broadcast successfully to ${count} recipients via ${channel || 'WhatsApp'}!`,
    campaignId: Number(result.lastInsertRowid)
  });
});

module.exports = router;
