const express = require('express');
const router = express.Router();
const { query, get, run, transaction } = require('../db');
const { requireAdmin, requireAuth, optionalAuth } = require('../middleware/auth');

// Public / Customer: Place a new order (Atomic Transaction & Stock Deduction)
router.post('/', optionalAuth, (req, res) => {
  const {
    customer,
    delivery,
    items,
    payment_method,
    coupon_code
  } = req.body;

  // Validation
  if (!customer || !customer.full_name || !customer.phone) {
    return res.status(400).json({ success: false, message: 'Customer name and phone number are required' });
  }

  if (!delivery || !delivery.address || !delivery.city || !delivery.pincode || !delivery.date || !delivery.slot) {
    return res.status(400).json({ success: false, message: 'All delivery address, date and slot details are required' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Shopping cart is empty' });
  }

  // Validate Delivery Pincode
  const zone = get('SELECT * FROM delivery_pincodes WHERE pincode = ? AND is_active = 1', [delivery.pincode.trim()]);
  if (!zone) {
    return res.status(400).json({ success: false, message: `Pincode ${delivery.pincode} is outside our delivery zone` });
  }

  // Validate Delivery Slot
  const slot = get('SELECT * FROM delivery_slots WHERE slot_name = ? AND is_active = 1', [delivery.slot]);
  const slotCharge = slot ? Number(slot.slot_charge) : 0;

  try {
    const createdOrder = transaction(() => {
      let subtotal = 0;
      const orderItemsToInsert = [];

      // 1. Verify stock and calculate price snapshot for each item
      for (const item of items) {
        const product = get('SELECT * FROM products WHERE id = ?', [item.product_id]);
        if (!product) {
          throw new Error(`Product not found (ID: ${item.product_id})`);
        }
        if (!product.is_active) {
          throw new Error(`Product "${product.name}" is no longer available`);
        }

        const requestedQty = Math.max(1, Number(item.quantity) || 1);
        if (product.stock_qty < requestedQty) {
          throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock_qty} available.`);
        }

        const unitBasePrice = Number(product.base_price);
        const unitDiscountPrice = product.discount_price ? Number(product.discount_price) : null;
        let effectiveUnitPrice = unitDiscountPrice || unitBasePrice;

        // Customization price adjustments (e.g. cake weight multiplier)
        const custom = item.customization || {};
        if (custom.weight) {
          const weightNum = parseFloat(custom.weight);
          if (weightNum > 0.5) {
            // Standard bakery multiplier: e.g. 1kg is ~1.8x, or fixed surcharge
            const extraWeight = weightNum - 0.5;
            const extraCharge = Math.round(extraWeight * (unitDiscountPrice ? unitDiscountPrice * 0.9 : unitBasePrice * 0.9));
            effectiveUnitPrice += extraCharge;
          }
        }

        const lineTotal = effectiveUnitPrice * requestedQty;
        subtotal += lineTotal;

        const images = JSON.parse(product.images_json || '[]');
        const primaryImage = images.length > 0 ? images[0] : '';

        orderItemsToInsert.push({
          product_id: product.id,
          product_name_snapshot: product.name,
          product_image_snapshot: primaryImage,
          unit_price_snapshot: unitBasePrice,
          discount_price_snapshot: effectiveUnitPrice,
          quantity: requestedQty,
          line_total: lineTotal,
          customization_details_json: JSON.stringify(custom)
        });
      }

      // 2. Validate Coupon if supplied
      let discountAmount = 0;
      let couponId = null;

      if (coupon_code && coupon_code.trim()) {
        const coupon = get('SELECT * FROM coupons WHERE UPPER(code) = ? AND is_active = 1', [coupon_code.trim().toUpperCase()]);
        if (coupon) {
          const today = new Date().toISOString().split('T')[0];
          const isValidDate = (!coupon.start_date || coupon.start_date <= today) && (!coupon.expiry_date || coupon.expiry_date >= today);
          const hasUsage = !coupon.usage_limit || coupon.times_used < coupon.usage_limit;
          const meetsMin = !coupon.min_order_value || subtotal >= coupon.min_order_value;

          if (isValidDate && hasUsage && meetsMin) {
            couponId = coupon.id;
            if (coupon.discount_type === 'percentage') {
              discountAmount = (subtotal * coupon.discount_value) / 100;
              if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
                discountAmount = coupon.max_discount_amount;
              }
            } else {
              discountAmount = Math.min(coupon.discount_value, subtotal);
            }
            discountAmount = Math.round(discountAmount * 100) / 100;
            // Update coupon usage count
            run('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [coupon.id]);
          }
        }
      }

      // 3. Compute delivery charge
      let deliveryCharge = Number(zone.delivery_charge) + slotCharge;
      if (zone.min_free_delivery_amount && subtotal >= zone.min_free_delivery_amount) {
        deliveryCharge = slotCharge; // free standard delivery, slot charge still applies if premium
      }

      const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);

      // 4. Generate unique order number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `FB-${datePart}-${randomPart}`;

      const userId = req.user ? req.user.id : null;
      const guestInfoJson = JSON.stringify({
        name: customer.full_name.trim(),
        email: (customer.email || '').trim(),
        phone: customer.phone.trim()
      });

      // Default payment status:
      // If UPI / Online payment, marked 'paid' in this flow (simulated instant gateway); if COD, marked 'pending'
      const paymentStatus = payment_method === 'upi_online' ? 'paid' : 'pending';

      // 5. Insert Order Header
      const orderResult = run(
        `INSERT INTO orders (
          order_number, user_id, guest_info_json, subtotal, discount_amount, delivery_charge,
          total_amount, coupon_id, payment_method, payment_status, order_status,
          delivery_pincode, delivery_address, delivery_city, delivery_date, delivery_slot,
          special_instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          guestInfoJson,
          subtotal,
          discountAmount,
          deliveryCharge,
          totalAmount,
          couponId,
          payment_method || 'cod',
          paymentStatus,
          delivery.pincode.trim(),
          delivery.address.trim(),
          delivery.city.trim(),
          delivery.date,
          delivery.slot,
          delivery.special_instructions || ''
        ]
      );

      const orderId = Number(orderResult.lastInsertRowid);

      // 6. Insert Order Items & Safely Decrement Product Stock
      for (const item of orderItemsToInsert) {
        run(
          `INSERT INTO order_items (
            order_id, product_id, product_name_snapshot, product_image_snapshot,
            unit_price_snapshot, discount_price_snapshot, quantity, line_total,
            customization_details_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.product_name_snapshot,
            item.product_image_snapshot,
            item.unit_price_snapshot,
            item.discount_price_snapshot,
            item.quantity,
            item.line_total,
            item.customization_details_json
          ]
        );

        // Safe Stock Deduction
        run(
          `UPDATE products SET stock_qty = stock_qty - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [item.quantity, item.product_id]
        );
      }

      // Return complete order summary
      const order = get('SELECT * FROM orders WHERE id = ?', [orderId]);
      return {
        ...order,
        items: orderItemsToInsert
      };
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! We are preparing your fresh order.',
      order: createdOrder
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Public: Track order by order number
router.get('/track/:orderNumber', (req, res) => {
  const cleanOrderNum = req.params.orderNumber.trim().toUpperCase();
  const order = get('SELECT * FROM orders WHERE UPPER(order_number) = ?', [cleanOrderNum]);

  if (!order) {
    return res.status(404).json({ success: false, message: `No order found with number ${cleanOrderNum}` });
  }

  const items = query('SELECT * FROM order_items WHERE order_id = ?', [order.id]).map(it => ({
    ...it,
    customization: JSON.parse(it.customization_details_json || '{}')
  }));

  const guestInfo = JSON.parse(order.guest_info_json || '{}');

  res.json({
    success: true,
    order: {
      ...order,
      customer_name: guestInfo.name,
      customer_email: guestInfo.email,
      customer_phone: guestInfo.phone,
      items
    }
  });
});

// Customer: Get my order history
router.get('/my-orders', requireAuth, (req, res) => {
  const orders = query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [req.user.id]);

  const detailedOrders = orders.map(ord => {
    const items = query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]).map(it => ({
      ...it,
      customization: JSON.parse(it.customization_details_json || '{}')
    }));
    return {
      ...ord,
      items
    };
  });

  res.json({ success: true, orders: detailedOrders });
});

// Admin: Get all orders with filtering and search
router.get('/admin', requireAdmin, (req, res) => {
  const { status, payment_status, shop_id, search, page = 1, limit = 50 } = req.query;

  let whereClauses = [];
  let params = [];

  if (status && status !== 'all') {
    if (status === 'confirm') {
      whereClauses.push("o.order_status IN ('confirm', 'confirmed')");
    } else if (status === 'ready') {
      whereClauses.push("o.order_status IN ('ready', 'preparing')");
    } else if (status === 'dispatched') {
      whereClauses.push("o.order_status IN ('dispatched', 'out_for_delivery')");
    } else if (status === 'closed') {
      whereClauses.push("o.order_status IN ('closed', 'delivered')");
    } else {
      whereClauses.push('o.order_status = ?');
      params.push(status);
    }
  }

  if (shop_id && shop_id !== 'all') {
    whereClauses.push('o.shop_id = ?');
    params.push(shop_id);
  }

  if (payment_status && payment_status !== 'all') {
    whereClauses.push('o.payment_status = ?');
    params.push(payment_status);
  }

  if (search && search.trim()) {
    whereClauses.push('(o.order_number LIKE ? OR o.delivery_city LIKE ? OR o.guest_info_json LIKE ? OR o.delivery_boy_name LIKE ?)');
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  const whereString = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
  const countRow = get(`SELECT COUNT(*) as count FROM orders o ${whereString}`, params);

  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  const sql = `
    SELECT o.*, u.full_name as registered_user_name, u.email as registered_user_email,
           s.name as shop_name, db.name as db_name, db.phone as db_phone, db.vehicle_type as db_vehicle
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN shops s ON s.id = o.shop_id
    LEFT JOIN delivery_boys db ON db.id = o.delivery_boy_id
    ${whereString}
    ORDER BY o.id DESC
    LIMIT ? OFFSET ?
  `;

  const orders = query(sql, [...params, Number(limit), offset]).map(ord => {
    const guest = JSON.parse(ord.guest_info_json || '{}');
    const items = query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]).map(it => ({
      ...it,
      customization: JSON.parse(it.customization_details_json || '{}')
    }));

    return {
      ...ord,
      customer_name: ord.registered_user_name || guest.name || 'Guest Customer',
      customer_email: ord.registered_user_email || guest.email || '',
      customer_phone: guest.phone || '',
      items
    };
  });

  res.json({
    success: true,
    total: countRow ? countRow.count : 0,
    orders
  });
});

// Admin: Get single order details
router.get('/admin/:id', requireAdmin, (req, res) => {
  const order = get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const items = query('SELECT * FROM order_items WHERE order_id = ?', [order.id]).map(it => ({
    ...it,
    customization: JSON.parse(it.customization_details_json || '{}')
  }));

  const guest = JSON.parse(order.guest_info_json || '{}');

  res.json({
    success: true,
    order: {
      ...order,
      customer_name: guest.name || 'Guest Customer',
      customer_email: guest.email || '',
      customer_phone: guest.phone || '',
      items
    }
  });
});

// Admin: Update order status (with stock restoration on cancellation)
router.patch('/admin/:id/status', requireAdmin, (req, res) => {
  const { status, cancellation_reason, delivery_boy_id, delivery_boy_name } = req.body;
  const validStatuses = [
    'new', 'confirm', 'confirmed', 'ready', 'preparing',
    'dispatched', 'out_for_delivery', 'closed', 'delivered',
    'cancelled', 'refunded'
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' });
  }

  const order = get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  try {
    transaction(() => {
      const prevStatus = order.order_status;

      // If transitioning to 'cancelled' and was previously not cancelled, restore inventory
      if (status === 'cancelled' && prevStatus !== 'cancelled') {
        const items = query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        for (const item of items) {
          if (item.product_id) {
            run(
              'UPDATE products SET stock_qty = stock_qty + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [item.quantity, item.product_id]
            );
          }
        }
      }

      // If reviving a previously cancelled order, re-deduct inventory
      if (prevStatus === 'cancelled' && status !== 'cancelled') {
        const items = query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        for (const item of items) {
          if (item.product_id) {
            run(
              'UPDATE products SET stock_qty = MAX(0, stock_qty - ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
              [item.quantity, item.product_id]
            );
          }
        }
      }

      run(
        `UPDATE orders SET
          order_status = ?,
          cancellation_reason = ?,
          delivery_boy_id = COALESCE(?, delivery_boy_id),
          delivery_boy_name = COALESCE(?, delivery_boy_name),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          status,
          cancellation_reason || order.cancellation_reason,
          delivery_boy_id !== undefined ? delivery_boy_id : null,
          delivery_boy_name || null,
          order.id
        ]
      );
    });

    res.json({
      success: true,
      message: `Order status updated to "${status}"`,
      order_status: status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating order status: ' + err.message });
  }
});

// Admin: Assign delivery boy to order
router.patch('/admin/:id/assign-delivery', requireAdmin, (req, res) => {
  const { delivery_boy_id } = req.body;
  const order = get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const boy = delivery_boy_id ? get('SELECT id, name, phone FROM delivery_boys WHERE id = ?', [delivery_boy_id]) : null;

  run('UPDATE orders SET delivery_boy_id = ?, delivery_boy_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
    boy ? boy.id : null,
    boy ? boy.name : null,
    order.id
  ]);

  res.json({
    success: true,
    message: boy ? `Assigned to delivery boy "${boy.name}"` : 'Delivery boy unassigned',
    delivery_boy_id: boy ? boy.id : null,
    delivery_boy_name: boy ? boy.name : null
  });
});

// Admin: Update payment status
router.patch('/admin/:id/payment', requireAdmin, (req, res) => {
  const { payment_status } = req.body;
  const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

  if (!validPaymentStatuses.includes(payment_status)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status' });
  }

  run(
    'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [payment_status, req.params.id]
  );

  res.json({
    success: true,
    message: `Payment status updated to "${payment_status}"`,
    payment_status
  });
});

module.exports = router;
