const bcrypt = require('bcryptjs');
const { initDatabase, query, get, run } = require('./db');

function seed() {
  console.log('Initializing Freshbunch Database schema...');
  initDatabase();

  // 1. Seed Admin & Customer Users
  const adminExists = get('SELECT id FROM users WHERE email = ?', ['admin@freshbunch.com']);
  if (!adminExists) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    run(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Freshbunch Admin', 'admin@freshbunch.com', '+91 98765 43210', adminHash, 'admin', 'active']
    );
    console.log('✓ Admin user seeded (admin@freshbunch.com / admin123)');
  }

  const customerExists = get('SELECT id FROM users WHERE email = ?', ['customer@freshbunch.com']);
  if (!customerExists) {
    const customerHash = bcrypt.hashSync('customer123', 10);
    run(
      `INSERT INTO users (full_name, email, phone, password_hash, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Sneha Roy', 'customer@freshbunch.com', '+91 98123 45678', customerHash, 'customer', 'active']
    );
    console.log('✓ Customer user seeded (customer@freshbunch.com / customer123)');
  }

  // 2. Seed Categories
  const categoriesData = [
    {
      name: 'Cakes',
      slug: 'cakes',
      description: 'Artisanal, freshly baked gourmet cakes handcrafted with love for every celebration.',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
      sort_order: 1
    },
    {
      name: 'Flowers',
      slug: 'flowers',
      description: 'Farm-fresh exotic blooms, handpicked roses, elegant lilies and exquisite arrangements.',
      image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
      sort_order: 2
    },
    {
      name: 'Gift Combos',
      slug: 'gift-combos',
      description: 'Curated celebration pairings featuring cakes, flowers, chocolates and teddy bears.',
      image_url: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=600&q=80',
      sort_order: 3
    },
    {
      name: 'Personalized Gifts',
      slug: 'personalized-gifts',
      description: 'Customized keepsakes, photo lamps, engraved mugs and bespoke memorable treasures.',
      image_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
      sort_order: 4
    },
    {
      name: 'Gifts',
      slug: 'gifts',
      description: 'Premium luxury hampers, gourmet chocolates, scented candles and plush toys.',
      image_url: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
      sort_order: 5
    }
  ];

  for (const cat of categoriesData) {
    const existing = get('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
    if (!existing) {
      run(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]
      );
    }
  }
  console.log('✓ Categories verified and seeded');

  // Helper to get category ID
  const getCatId = (slug) => get('SELECT id FROM categories WHERE slug = ?', [slug]).id;

  // 3. Seed Products
  const productsData = [
    // CAKES
    {
      category_slug: 'cakes',
      name: 'Belgian Dark Chocolate Truffle Cake',
      slug: 'belgian-dark-chocolate-truffle-cake',
      description: 'Layers of decadent 70% pure Belgian dark chocolate ganache encased in silky chocolate glaze and crowned with hand-rolled gold-dusted truffles. Moist, rich and irresistible.',
      short_desc: 'Decadent 70% dark Belgian ganache with golden dusted truffles.',
      base_price: 649,
      discount_price: 549,
      stock_qty: 24,
      low_stock_threshold: 5,
      sku: 'CK-BELG-01',
      is_featured: 1,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'cake',
        weights: ['0.5kg', '1kg', '1.5kg', '2kg'],
        flavors: ['Classic Belgian Truffle', 'Dark Walnut Truffle', 'Orange Infused Truffle'],
        supports_eggless: true,
        supports_cake_message: true
      }
    },
    {
      category_slug: 'cakes',
      name: 'Red Velvet Heart Cream Cheese Cake',
      slug: 'red-velvet-heart-cream-cheese-cake',
      description: 'Velvety crimson sponge layered with authentic Philadelphia cream cheese frosting and a hint of vanilla bean. Perfect for anniversaries, birthdays and romantic surprises.',
      short_desc: 'Velvety crimson sponge with authentic cream cheese frosting.',
      base_price: 749,
      discount_price: 649,
      stock_qty: 18,
      low_stock_threshold: 4,
      sku: 'CK-REDV-02',
      is_featured: 1,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'cake',
        weights: ['0.5kg', '1kg', '1.5kg', '2kg'],
        flavors: ['Classic Cream Cheese', 'Strawberry Velvet Swirl'],
        supports_eggless: true,
        supports_cake_message: true
      }
    },
    {
      category_slug: 'cakes',
      name: 'Fresh Exotic Seasonal Fruit Gateau',
      slug: 'fresh-exotic-seasonal-fruit-gateau',
      description: 'Fluffy light Madagascar vanilla sponge layered with whipped mascarpone cream and overflowing with fresh kiwi, dragonfruit, strawberries, blueberries, and candied oranges.',
      short_desc: 'Airy vanilla sponge topped with fresh seasonal berries and kiwi.',
      base_price: 699,
      discount_price: 599,
      stock_qty: 12,
      low_stock_threshold: 4,
      sku: 'CK-FRUIT-03',
      is_featured: 0,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'cake',
        weights: ['0.5kg', '1kg', '1.5kg'],
        flavors: ['Mixed Fruit Bliss', 'Mango Passionfruit'],
        supports_eggless: true,
        supports_cake_message: true
      }
    },
    {
      category_slug: 'cakes',
      name: 'Salted Butterscotch Crunch Royale',
      slug: 'salted-butterscotch-crunch-royale',
      description: 'Caramelized butterscotch praline, crunchy nougat bits, whipped caramel cream and golden drip glaze. A nostalgic childhood favorite crafted with gourmet pastry elegance.',
      short_desc: 'Crunchy caramel praline nougat with velvety butterscotch cream.',
      base_price: 599,
      discount_price: 499,
      stock_qty: 8,
      low_stock_threshold: 5,
      sku: 'CK-BUTT-04',
      is_featured: 0,
      is_bestseller: 0,
      images: [
        'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'cake',
        weights: ['0.5kg', '1kg', '2kg'],
        flavors: ['Classic Butterscotch', 'Salted Caramel Crunch'],
        supports_eggless: true,
        supports_cake_message: true
      }
    },
    {
      category_slug: 'cakes',
      name: 'New York Blueberry Swirl Baked Cheesecake',
      slug: 'new-york-blueberry-swirl-baked-cheesecake',
      description: 'Authentic dense and creamy New York-style baked cheesecake on a buttery graham cracker crust, topped with handcrafted slow-cooked Canadian wild blueberry compote.',
      short_desc: 'Creamy baked cheesecake with handcrafted wild blueberry compote.',
      base_price: 899,
      discount_price: 799,
      stock_qty: 3, // LOW STOCK FOR TEST!
      low_stock_threshold: 5,
      sku: 'CK-CHSE-05',
      is_featured: 1,
      is_bestseller: 0,
      images: [
        'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'cake',
        weights: ['0.5kg', '1kg'],
        flavors: ['Wild Blueberry', 'Strawberry Crumble'],
        supports_eggless: false,
        supports_cake_message: true
      }
    },

    // FLOWERS
    {
      category_slug: 'flowers',
      name: '24 Regal Dutch Red Roses in Signature Box',
      slug: '24-regal-dutch-red-roses-in-signature-box',
      description: 'Two dozen velvety long-stemmed premium Dutch red roses, hand-arranged with baby breath fillers in our luxurious pastel blush presentation box with satin ribbon finish.',
      short_desc: '24 long-stemmed Dutch red roses in luxury pastel presentation box.',
      base_price: 999,
      discount_price: 849,
      stock_qty: 30,
      low_stock_threshold: 6,
      sku: 'FL-ROSE-01',
      is_featured: 1,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'flower',
        flower_type: 'Dutch Roses',
        stem_counts: ['12 Roses', '24 Roses', '50 Roses'],
        colors: ['Deep Red', 'Pastel Blush Pink', 'Snow White', 'Sunshine Yellow'],
        arrangement_options: ['Luxury Gift Box', 'Artisan Matte Wrap', 'Glass Vase Arrangement']
      }
    },
    {
      category_slug: 'flowers',
      name: 'Pastel Lilies & Carnations Whisper Bouquet',
      slug: 'pastel-lilies-and-carnations-whisper-bouquet',
      description: 'Fragrant pink oriental lilies nestled among soft peach carnations, white hydrangeas and eucalyptus greens, wrapped in handcrafted textured Korean paper.',
      short_desc: 'Fragrant pink oriental lilies and peach carnations with eucalyptus.',
      base_price: 849,
      discount_price: 749,
      stock_qty: 20,
      low_stock_threshold: 5,
      sku: 'FL-LILY-02',
      is_featured: 1,
      is_bestseller: 0,
      images: [
        'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'flower',
        flower_type: 'Oriental Lilies',
        stem_counts: ['Standard (6 stems)', 'Deluxe (10 stems)', 'Grand (16 stems)'],
        colors: ['Soft Pink & Peach', 'Pure White & Green'],
        arrangement_options: ['Textured Korean Wrap', 'Clear Glass Cylinder Vase']
      }
    },
    {
      category_slug: 'flowers',
      name: 'Royal Purple Orchids Exotic Bouquet',
      slug: 'royal-purple-orchids-exotic-bouquet',
      description: 'Vibrant imported purple Dendrobium orchids complemented with lush green ferns and wrapped in bespoke royal lavender wrapping paper.',
      short_desc: 'Exotic purple Dendrobium orchids wrapped in bespoke lavender paper.',
      base_price: 799,
      discount_price: 699,
      stock_qty: 15,
      low_stock_threshold: 4,
      sku: 'FL-ORCH-03',
      is_featured: 0,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'flower',
        flower_type: 'Dendrobium Orchids',
        stem_counts: ['8 stems', '12 stems', '20 stems'],
        colors: ['Vibrant Purple', 'Snow White'],
        arrangement_options: ['Artisan Wrap', 'Ceramic Tabletop Vase']
      }
    },

    // COMBOS
    {
      category_slug: 'gift-combos',
      name: 'Romantic Radiance Combo (Red Roses + Chocolate Cake)',
      slug: 'romantic-radiance-combo',
      description: 'The ultimate celebration bundle: 12 Fresh Dutch Red Roses bouquet paired with our bestselling 0.5kg Belgian Chocolate Truffle Cake and a luxury greeting card.',
      short_desc: '12 Red Roses bouquet + 0.5kg Belgian Chocolate Cake + Greeting card.',
      base_price: 1399,
      discount_price: 1199,
      stock_qty: 25,
      low_stock_threshold: 5,
      sku: 'CM-ROM-01',
      is_featured: 1,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'combo',
        cake_weights: ['0.5kg', '1kg'],
        cake_flavor: 'Belgian Chocolate Truffle',
        flower_count: '12 Roses',
        supports_eggless: true,
        greeting_card_message: true
      }
    },
    {
      category_slug: 'gift-combos',
      name: 'Grand Birthday Surprise Hamper Box',
      slug: 'grand-birthday-surprise-hamper-box',
      description: 'An extraordinary gift hamper featuring a 0.5kg Red Velvet Cake, 10 mixed pastel carnations, 16 pcs Ferrero Rocher chocolates, and a 6-inch cuddly teddy bear.',
      short_desc: 'Red Velvet Cake + Carnations + Ferrero Rocher + Cuddly Teddy.',
      base_price: 1899,
      discount_price: 1599,
      stock_qty: 16,
      low_stock_threshold: 4,
      sku: 'CM-BDAY-02',
      is_featured: 1,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'combo',
        cake_weights: ['0.5kg', '1kg'],
        supports_eggless: true,
        greeting_card_message: true
      }
    },

    // PERSONALIZED GIFTS
    {
      category_slug: 'personalized-gifts',
      name: 'Custom Engraved 3D Acrylic Photo Lamp',
      slug: 'custom-engraved-3d-acrylic-photo-lamp',
      description: 'Cast your treasured memories in a gentle warm glow. High-grade optical acrylic laser-engraved with your custom photograph and personalized message on a solid beechwood LED base.',
      short_desc: 'Laser-engraved custom photo lamp on solid wooden warm LED base.',
      base_price: 899,
      discount_price: 749,
      stock_qty: 40,
      low_stock_threshold: 8,
      sku: 'PG-LAMP-01',
      is_featured: 1,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'personalized',
        personalization_fields: ['Recipient Name', 'Custom Message / Date', 'Photo Upload Placeholder'],
        base_options: ['Natural Beech Wood', 'Walnut Dark Finish']
      }
    },
    {
      category_slug: 'personalized-gifts',
      name: 'Personalized Couple Ceramic Mug Set with Spoons',
      slug: 'personalized-couple-ceramic-mug-set',
      description: 'Handcrafted ceramic duo mugs in pastel blush and porcelain white, monogrammed with custom gold calligraphy names and matching brass stirring spoons.',
      short_desc: 'Monogrammed pastel ceramic mugs with gold calligraphy and spoons.',
      base_price: 599,
      discount_price: 499,
      stock_qty: 22,
      low_stock_threshold: 5,
      sku: 'PG-MUG-02',
      is_featured: 0,
      is_bestseller: 0,
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'personalized',
        personalization_fields: ['Name 1', 'Name 2', 'Anniversary Date']
      }
    },

    // GIFTS
    {
      category_slug: 'gifts',
      name: 'Luxury Belgian Artisan Chocolate Praline Box (16 Pcs)',
      slug: 'luxury-belgian-artisan-chocolate-praline-box',
      description: 'Handcrafted selection of pure cocoa butter pralines filled with salted hazelnut cream, raspberry liqueur, dark espresso truffle, and Madagascar vanilla bean caramel.',
      short_desc: '16-piece handcrafted artisan Belgian praline chocolate box.',
      base_price: 699,
      discount_price: 599,
      stock_qty: 35,
      low_stock_threshold: 6,
      sku: 'GF-CHOC-01',
      is_featured: 0,
      is_bestseller: 1,
      images: [
        'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        type: 'gift',
        box_sizes: ['16 Pcs', '24 Pcs']
      }
    }
  ];

  for (const prod of productsData) {
    const existing = get('SELECT id FROM products WHERE slug = ?', [prod.slug]);
    const catId = getCatId(prod.category_slug);
    if (!existing && catId) {
      run(
        `INSERT INTO products (
          category_id, name, slug, description, short_desc, base_price, discount_price,
          stock_qty, low_stock_threshold, sku, is_active, is_featured, is_bestseller,
          images_json, custom_attributes_schema
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
        [
          catId,
          prod.name,
          prod.slug,
          prod.description,
          prod.short_desc,
          prod.base_price,
          prod.discount_price,
          prod.stock_qty,
          prod.low_stock_threshold,
          prod.sku,
          prod.is_featured,
          prod.is_bestseller,
          JSON.stringify(prod.images),
          JSON.stringify(prod.custom_attributes_schema)
        ]
      );
    }
  }
  console.log('✓ Products verified and seeded');

  // 4. Seed Delivery Pincodes
  const pincodesData = [
    { pincode: '560001', area_name: 'MG Road / Brigade', city: 'Bengaluru', delivery_charge: 49, min_free_delivery_amount: 599, same_day_cutoff_time: '18:00' },
    { pincode: '560034', area_name: 'Koramangala 4th Block', city: 'Bengaluru', delivery_charge: 49, min_free_delivery_amount: 599, same_day_cutoff_time: '18:00' },
    { pincode: '560038', area_name: 'Indiranagar 100ft Rd', city: 'Bengaluru', delivery_charge: 49, min_free_delivery_amount: 599, same_day_cutoff_time: '18:00' },
    { pincode: '560100', area_name: 'Electronic City Phase 1', city: 'Bengaluru', delivery_charge: 79, min_free_delivery_amount: 799, same_day_cutoff_time: '17:00' },
    { pincode: '400001', area_name: 'Fort / Colaba', city: 'Mumbai', delivery_charge: 59, min_free_delivery_amount: 699, same_day_cutoff_time: '17:30' },
    { pincode: '400050', area_name: 'Bandra West / Pali Hill', city: 'Mumbai', delivery_charge: 59, min_free_delivery_amount: 699, same_day_cutoff_time: '18:00' },
    { pincode: '110001', area_name: 'Connaught Place', city: 'New Delhi', delivery_charge: 59, min_free_delivery_amount: 699, same_day_cutoff_time: '17:30' }
  ];

  for (const pin of pincodesData) {
    const existing = get('SELECT id FROM delivery_pincodes WHERE pincode = ?', [pin.pincode]);
    if (!existing) {
      run(
        `INSERT INTO delivery_pincodes (pincode, area_name, city, delivery_charge, min_free_delivery_amount, same_day_cutoff_time, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [pin.pincode, pin.area_name, pin.city, pin.delivery_charge, pin.min_free_delivery_amount, pin.same_day_cutoff_time]
      );
    }
  }
  console.log('✓ Serviceable delivery pincodes seeded');

  // 5. Seed Delivery Slots
  const slotsData = [
    { slot_name: 'Morning Delight (09:00 AM - 12:00 PM)', start_time: '09:00', end_time: '12:00', slot_charge: 0, max_orders_per_slot: 40 },
    { slot_name: 'Standard Afternoon (01:00 PM - 05:00 PM)', start_time: '13:00', end_time: '17:00', slot_charge: 0, max_orders_per_slot: 60 },
    { slot_name: 'Romantic Evening (06:00 PM - 09:00 PM)', start_time: '18:00', end_time: '21:00', slot_charge: 29, max_orders_per_slot: 45 },
    { slot_name: 'Midnight Surprise (11:00 PM - 12:00 AM)', start_time: '23:00', end_time: '23:59', slot_charge: 99, max_orders_per_slot: 25 }
  ];

  for (const slot of slotsData) {
    const existing = get('SELECT id FROM delivery_slots WHERE slot_name = ?', [slot.slot_name]);
    if (!existing) {
      run(
        `INSERT INTO delivery_slots (slot_name, start_time, end_time, slot_charge, max_orders_per_slot, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [slot.slot_name, slot.start_time, slot.end_time, slot.slot_charge, slot.max_orders_per_slot]
      );
    }
  }
  console.log('✓ Delivery slots seeded');

  // 6. Seed Coupons
  const couponsData = [
    { code: 'FRESH10', description: '10% off on all orders above ₹499 (Max discount ₹200)', discount_type: 'percentage', discount_value: 10, min_order_value: 499, max_discount_amount: 200 },
    { code: 'SWEET100', description: 'Flat ₹100 instant discount on orders above ₹799', discount_type: 'fixed', discount_value: 100, min_order_value: 799, max_discount_amount: 100 },
    { code: 'WELCOME20', description: '20% off for new celebrations above ₹999 (Max discount ₹350)', discount_type: 'percentage', discount_value: 20, min_order_value: 999, max_discount_amount: 350 }
  ];

  for (const c of couponsData) {
    const existing = get('SELECT id FROM coupons WHERE code = ?', [c.code]);
    if (!existing) {
      run(
        `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount_amount, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [c.code, c.description, c.discount_type, c.discount_value, c.min_order_value, c.max_discount_amount]
      );
    }
  }
  console.log('✓ Promotional coupons seeded');

  // 7. Seed Reviews
  const reviewsData = [
    { product_slug: 'belgian-dark-chocolate-truffle-cake', name: 'Aarav Sharma', rating: 5, comment: 'Absolutely divine! The Belgian chocolate was pure luxury and arrived chilled in pristine condition.' },
    { product_slug: 'belgian-dark-chocolate-truffle-cake', name: 'Pooja Verma', rating: 5, comment: 'Ordered for my husband’s birthday. Custom message was piped beautifully and eggless version was super moist!' },
    { product_slug: '24-regal-dutch-red-roses-in-signature-box', name: 'Rohan Mehra', rating: 5, comment: 'Delivered right at midnight! The roses were so fresh and stayed fragrant for 4 full days.' },
    { product_slug: 'romantic-radiance-combo', name: 'Ananya Deshmukh', rating: 5, comment: 'Best anniversary gift combo! The cake tasted heavenly and the rose bouquet was huge.' }
  ];

  for (const rev of reviewsData) {
    const prod = get('SELECT id FROM products WHERE slug = ?', [rev.product_slug]);
    if (prod) {
      const existing = get('SELECT id FROM reviews WHERE product_id = ? AND customer_name = ?', [prod.id, rev.name]);
      if (!existing) {
        run(
          `INSERT INTO reviews (product_id, customer_name, rating, comment, is_verified_purchase)
           VALUES (?, ?, ?, ?, 1)`,
          [prod.id, rev.name, rev.rating, rev.comment]
        );
      }
    }
  }

  // 8. Seed Initial Orders for rich Admin Dashboard metrics
  const orderCount = get('SELECT COUNT(*) as count FROM orders');
  if (orderCount && orderCount.count === 0) {
    console.log('Seeding initial orders for realistic dashboard metrics...');
    const user = get("SELECT id FROM users WHERE role = 'customer'");
    const belgianCake = get('SELECT * FROM products WHERE slug = ?', ['belgian-dark-chocolate-truffle-cake']);
    const redRoses = get('SELECT * FROM products WHERE slug = ?', ['24-regal-dutch-red-roses-in-signature-box']);

    // Order 1: Delivered
    const ord1 = run(
      `INSERT INTO orders (
        order_number, user_id, guest_info_json, subtotal, discount_amount, delivery_charge,
        total_amount, payment_method, payment_status, order_status, delivery_pincode,
        delivery_address, delivery_city, delivery_date, delivery_slot, special_instructions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now', '-2 days'), ?, ?, DATETIME('now', '-2 days'))`,
      [
        'FB-20261106-1021',
        user ? user.id : null,
        JSON.stringify({ name: 'Sneha Roy', email: 'customer@freshbunch.com', phone: '+91 98123 45678' }),
        1398,
        100,
        0,
        1298,
        'upi_online',
        'paid',
        'delivered',
        '560034',
        'Flat 402, Lotus Orchid, Koramangala',
        'Bengaluru',
        'Standard Afternoon (01:00 PM - 05:00 PM)',
        'Please deliver with care'
      ]
    );

    const ord1Id = Number(ord1.lastInsertRowid);
    run(
      `INSERT INTO order_items (order_id, product_id, product_name_snapshot, product_image_snapshot, unit_price_snapshot, discount_price_snapshot, quantity, line_total, customization_details_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ord1Id, belgianCake.id, belgianCake.name, JSON.parse(belgianCake.images_json)[0], 649, 549, 1, 549, JSON.stringify({ weight: '1kg', flavor: 'Classic Belgian Truffle', eggless: true, message: 'Happy 25th Rohit!' })]
    );
    run(
      `INSERT INTO order_items (order_id, product_id, product_name_snapshot, product_image_snapshot, unit_price_snapshot, discount_price_snapshot, quantity, line_total, customization_details_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ord1Id, redRoses.id, redRoses.name, JSON.parse(redRoses.images_json)[0], 999, 849, 1, 849, JSON.stringify({ stems: '24 Roses', color: 'Deep Red' })]
    );

    // Order 2: Preparing (Today's order)
    const ord2 = run(
      `INSERT INTO orders (
        order_number, user_id, guest_info_json, subtotal, discount_amount, delivery_charge,
        total_amount, payment_method, payment_status, order_status, delivery_pincode,
        delivery_address, delivery_city, delivery_date, delivery_slot, special_instructions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'), ?, ?, DATETIME('now', '-2 hours'))`,
      [
        'FB-20261108-3042',
        null,
        JSON.stringify({ name: 'Vikram Malhotra', email: 'vikram.m@gmail.com', phone: '+91 99887 66554' }),
        649,
        0,
        49,
        698,
        'cod',
        'pending',
        'preparing',
        '560001',
        'Villa 12, Palm Meadows, MG Road',
        'Bengaluru',
        'Romantic Evening (06:00 PM - 09:00 PM)',
        'Call recipient before delivery'
      ]
    );
    const ord2Id = Number(ord2.lastInsertRowid);
    const redVelvet = get('SELECT * FROM products WHERE slug = ?', ['red-velvet-heart-cream-cheese-cake']);
    run(
      `INSERT INTO order_items (order_id, product_id, product_name_snapshot, product_image_snapshot, unit_price_snapshot, discount_price_snapshot, quantity, line_total, customization_details_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ord2Id, redVelvet.id, redVelvet.name, JSON.parse(redVelvet.images_json)[0], 749, 649, 1, 649, JSON.stringify({ weight: '0.5kg', eggless: true, message: 'I Love You Riya' })]
    );

    // Order 3: New Order (Just placed)
    const ord3 = run(
      `INSERT INTO orders (
        order_number, user_id, guest_info_json, subtotal, discount_amount, delivery_charge,
        total_amount, payment_method, payment_status, order_status, delivery_pincode,
        delivery_address, delivery_city, delivery_date, delivery_slot, special_instructions, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE('now'), ?, ?, CURRENT_TIMESTAMP)`,
      [
        'FB-20261108-8819',
        null,
        JSON.stringify({ name: 'Deepika Iyer', email: 'deepika.iyer@outlook.com', phone: '+91 98450 12345' }),
        1199,
        119.9,
        0,
        1079.1,
        'upi_online',
        'paid',
        'new',
        '560038',
        'Penthouse 9, Sunshine Heights, Indiranagar',
        'Bengaluru',
        'Midnight Surprise (11:00 PM - 12:00 AM)',
        'Midnight birthday countdown surprise!'
      ]
    );
    const ord3Id = Number(ord3.lastInsertRowid);
    const romanceCombo = get('SELECT * FROM products WHERE slug = ?', ['romantic-radiance-combo']);
    run(
      `INSERT INTO order_items (order_id, product_id, product_name_snapshot, product_image_snapshot, unit_price_snapshot, discount_price_snapshot, quantity, line_total, customization_details_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ord3Id, romanceCombo.id, romanceCombo.name, JSON.parse(romanceCombo.images_json)[0], 1399, 1199, 1, 1199, JSON.stringify({ cake_weight: '0.5kg', card_message: 'Happy Birthday to my sweetest star!' })]
    );

    console.log('✓ Realistic seed orders created');
  }

  // 9. Seed Rich CRM Data (Tags, Occasions, Tasks, Interactions)
  console.log('Seeding CRM customers, occasions, interactions and operations tasks...');
  
  // Update Sneha Roy with VIP CRM details
  run(`
    UPDATE users SET
      lifecycle_stage = 'vip',
      tags_json = ?,
      occasions_json = ?,
      notes = ?,
      preferred_category = 'Cakes',
      company_name = 'Infosys Technologies'
    WHERE email = 'customer@freshbunch.com'
  `, [
    JSON.stringify(['VIP', 'Eggless-Only', 'High LTV', 'Anniversary Regular']),
    JSON.stringify([
      { title: "Husband Rohit's Birthday", date: '11-12', relation: 'Spouse' },
      { title: 'Wedding Anniversary', date: '12-24', relation: 'Spouse' }
    ]),
    'Prefers ultra-moist eggless Belgian Chocolate Truffle. High attention to piped text precision.'
  ]);

  // Seed additional customers for CRM segmentation
  const moreCustomers = [
    {
      name: 'Vikram Malhotra',
      email: 'vikram.m@gmail.com',
      phone: '+91 99887 66554',
      stage: 'repeat',
      tags: ['Corporate Gifter', 'Flowers Regular'],
      occasions: [{ title: "Daughter Rhea's Birthday", date: '11-18', relation: 'Child' }],
      notes: 'Orders flower bouquets for client milestone celebrations.'
    },
    {
      name: 'Dr. Deepika Iyer',
      email: 'deepika.iyer@outlook.com',
      phone: '+91 98450 12345',
      stage: 'first_time',
      tags: ['Midnight Buyer', 'Combos'],
      occasions: [{ title: 'Sister Meera Anniversary', date: '11-25', relation: 'Sister' }],
      notes: 'Loves romantic radiance combo with greeting card handwritten.'
    },
    {
      name: 'Rajesh Kulkarni',
      email: 'rajesh.k@gmail.com',
      phone: '+91 97654 32109',
      stage: 'at_risk',
      tags: ['Cheesecake Lover', 'At-Risk'],
      occasions: [{ title: 'Parents 50th Golden Jubilee', date: '12-05', relation: 'Parents' }],
      notes: 'Has not ordered in 45 days. Follow up with 15% comeback coupon.'
    }
  ];

  for (const c of moreCustomers) {
    const exists = get('SELECT id FROM users WHERE email = ?', [c.email]);
    if (!exists) {
      const hash = bcrypt.hashSync('customer123', 10);
      run(`
        INSERT INTO users (full_name, email, phone, password_hash, role, status, lifecycle_stage, tags_json, occasions_json, notes)
        VALUES (?, ?, ?, ?, 'customer', 'active', ?, ?, ?, ?)
      `, [
        c.name, c.email, c.phone, hash, c.stage, JSON.stringify(c.tags), JSON.stringify(c.occasions), c.notes
      ]);
    }
  }

  // Seed CRM Tasks
  const taskCount = get('SELECT COUNT(*) as count FROM crm_tasks').count;
  if (taskCount === 0) {
    const tasks = [
      { title: "Call Vikram Malhotra to confirm customized greeting message for order FB-20261108-3042", priority: 'high', due_date: new Date().toISOString().split('T')[0], assigned_to: 'Support (Neha)', customer_name: 'Vikram Malhotra' },
      { title: "Proactively WhatsApp Sneha Roy with 15% VIP offer for Husband's upcoming Birthday (Nov 12)", priority: 'urgent', due_date: new Date().toISOString().split('T')[0], assigned_to: 'CRM Lead (Anil)', customer_name: 'Sneha Roy' },
      { title: "Procure 40 extra Dutch Red Roses stems from Ooty farm for weekend anniversary surge", priority: 'medium', due_date: '2026-11-10', assigned_to: 'Florist Team', customer_name: 'Florist Ops' },
      { title: "Send comeback win-back promo to Rajesh Kulkarni for upcoming Parents Golden Jubilee", priority: 'medium', due_date: '2026-11-12', assigned_to: 'Retention Ops', customer_name: 'Rajesh Kulkarni' }
    ];

    for (const t of tasks) {
      run(`
        INSERT INTO crm_tasks (title, priority, due_date, assigned_to, customer_name, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `, [t.title, t.priority, t.due_date, t.assigned_to, t.customer_name]);
    }
  }

  // Seed CRM Interactions
  const interCount = get('SELECT COUNT(*) as count FROM crm_interactions').count;
  if (interCount === 0) {
    const interactions = [
      {
        customer_name: 'Sneha Roy',
        customer_phone: '+91 98123 45678',
        channel: 'whatsapp',
        direction: 'outbound',
        subject: 'Order Dispatch Confirmation',
        content: 'Hi Sneha! Your Belgian Dark Truffle Cake has been baked fresh and dispatched with our rider Rajesh (+91 98765 11223).'
      },
      {
        customer_name: 'Vikram Malhotra',
        customer_phone: '+91 99887 66554',
        channel: 'call',
        direction: 'inbound',
        subject: 'Cake Custom Message Verification',
        content: 'Customer called to ensure eggless chocolate cake message is piped in elegant gold script. Confirmed with master chef.'
      },
      {
        customer_name: 'Dr. Deepika Iyer',
        customer_phone: '+91 98450 12345',
        channel: 'whatsapp',
        direction: 'outbound',
        subject: 'Delivery Review & Feedback',
        content: 'Thank you for choosing Freshbunch! How was your midnight surprise experience with the romantic combo?'
      }
    ];

    for (const it of interactions) {
      run(`
        INSERT INTO crm_interactions (customer_name, customer_phone, channel, direction, subject, content)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [it.customer_name, it.customer_phone, it.channel, it.direction, it.subject, it.content]);
    }
  }

  // Seed Shops (Multi-Shop SaaS)
  const shopCount = get("SELECT COUNT(*) as count FROM shops").count;
  if (shopCount === 0) {
    const defaultShops = [
      {
        name: 'Freshbunch Flagship Patisserie',
        slug: 'freshbunch-flagship-patisserie',
        owner_name: 'Master Chef Marco',
        phone: '+91 98450 88001',
        email: 'indiranagar@freshbunch.com',
        address: '100ft Road, HAL 2nd Stage, Indiranagar',
        city: 'Bangalore',
        description: 'Artisanal gourmet baking studio specializing in Belgian truffle cakes, cheesecakes and hand-crafted gateaux.',
        image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
      },
      {
        name: 'Freshbunch Floral & Hamper Boutique',
        slug: 'freshbunch-floral-boutique',
        owner_name: 'Maya Sen',
        phone: '+91 98450 88002',
        email: 'koramangala@freshbunch.com',
        address: '5th Block, Koramangala',
        city: 'Bangalore',
        description: 'Luxury botanical studio crafting fresh Dutch rose bouquets, orchids, and personalized gift hampers.',
        image_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800'
      },
      {
        name: 'Freshbunch Sweet Delights Express',
        slug: 'freshbunch-sweet-delights',
        owner_name: 'Chef Vikram',
        phone: '+91 98450 88003',
        email: 'whitefield@freshbunch.com',
        address: 'ITPL Main Road, Whitefield',
        city: 'Bangalore',
        description: 'Quick fulfillment bakery for same-day delivery cakes, cupcakes, and party combos.',
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'
      }
    ];

    for (const s of defaultShops) {
      run(`
        INSERT INTO shops (name, slug, owner_name, phone, email, address, city, description, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [s.name, s.slug, s.owner_name, s.phone, s.email, s.address, s.city, s.description, s.image_url]);
    }

    // Assign existing products to these shops
    const allShops = query('SELECT id, name FROM shops');
    if (allShops.length >= 3) {
      run('UPDATE products SET shop_id = ? WHERE category_id = 1', [allShops[0].id]);
      run('UPDATE products SET shop_id = ? WHERE category_id = 2', [allShops[1].id]);
      run('UPDATE products SET shop_id = ? WHERE category_id IN (3, 4, 5)', [allShops[2].id]);
    }
  }

  // Seed Delivery Boys
  const deliveryBoyCount = get("SELECT COUNT(*) as count FROM delivery_boys").count;
  if (deliveryBoyCount === 0) {
    const defaultRiders = [
      {
        name: 'Rahul Verma',
        phone: '+91 98765 11001',
        email: 'rahul.rider@freshbunch.com',
        vehicle_type: 'bike',
        vehicle_number: 'KA-01-AB-1234',
        city: 'Bangalore',
        service_zone: 'Indiranagar & Central'
      },
      {
        name: 'Amit Kumar',
        phone: '+91 98765 11002',
        email: 'amit.rider@freshbunch.com',
        vehicle_type: 'scooter',
        vehicle_number: 'KA-03-CD-5678',
        city: 'Bangalore',
        service_zone: 'Koramangala & HSR'
      },
      {
        name: 'Suresh Patil',
        phone: '+91 98765 11003',
        email: 'suresh.van@freshbunch.com',
        vehicle_type: 'van',
        vehicle_number: 'KA-04-EF-9012',
        city: 'Bangalore',
        service_zone: 'Whitefield & East Zone (Cold Van)'
      }
    ];

    for (const r of defaultRiders) {
      run(`
        INSERT INTO delivery_boys (name, phone, email, vehicle_type, vehicle_number, city, service_zone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [r.name, r.phone, r.email, r.vehicle_type, r.vehicle_number, r.city, r.service_zone]);
    }
  }

  console.log('✓ Shops & Delivery Boys successfully seeded');
  console.log('✨ Database seeding successfully completed!');
}

seed();
