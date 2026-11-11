const bcrypt = require('bcryptjs');
const { supabase } = require('./supabase');

if (!supabase) {
  console.error('❌ Supabase client is not initialized. Please verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

async function seedSupabase() {
  console.log('🌸 Starting Supabase Database Seeding...');

  // 1. Seed Users
  console.log('Seeding demo users into Supabase...');
  const adminHash = bcrypt.hashSync('admin123', 10);
  const customerHash = bcrypt.hashSync('customer123', 10);

  const { data: existingAdmin } = await supabase.from('users').select('id').eq('email', 'admin@freshbunch.com').single();
  if (!existingAdmin) {
    await supabase.from('users').insert({
      full_name: 'Freshbunch Admin',
      email: 'admin@freshbunch.com',
      phone: '+91 98765 43210',
      password_hash: adminHash,
      role: 'admin',
      status: 'active'
    });
    console.log('✓ Admin user seeded (admin@freshbunch.com / admin123)');
  }

  const { data: existingCustomer } = await supabase.from('users').select('id').eq('email', 'customer@freshbunch.com').single();
  if (!existingCustomer) {
    await supabase.from('users').insert({
      full_name: 'Sneha Roy',
      email: 'customer@freshbunch.com',
      phone: '+91 98123 45678',
      password_hash: customerHash,
      role: 'customer',
      status: 'active'
    });
    console.log('✓ Customer user seeded (customer@freshbunch.com / customer123)');
  }

  // 2. Seed Shops
  console.log('Seeding shops...');
  const shopsData = [
    {
      name: 'Freshbunch Flagship Studio - Indiranagar',
      slug: 'freshbunch-indiranagar',
      owner_name: 'Marco Rossi',
      phone: '+91 98765 11111',
      email: 'indiranagar@freshbunch.com',
      address: '100 Feet Rd, HAL 2nd Stage, Indiranagar',
      city: 'Bangalore',
      status: 'active',
      description: 'Master bakery & floral artisan hub delivering express within 2 hours across East Bangalore.'
    },
    {
      name: 'Freshbunch Boutique Kitchen - Koramangala',
      slug: 'freshbunch-koramangala',
      owner_name: 'Vikram Mehta',
      phone: '+91 98765 22222',
      email: 'koramangala@freshbunch.com',
      address: '5th Block, Koramangala',
      city: 'Bangalore',
      status: 'active',
      description: 'Specialty designer cake kitchen and imported flower cold-storage hub.'
    }
  ];

  for (const shop of shopsData) {
    const { data: existingShop } = await supabase.from('shops').select('id').eq('slug', shop.slug).single();
    if (!existingShop) {
      await supabase.from('shops').insert(shop);
    }
  }
  console.log('✓ Shops verified and seeded');

  // 3. Seed Delivery Boys
  console.log('Seeding delivery fleet...');
  const deliveryBoysData = [
    {
      name: 'Rahul Sharma',
      phone: '+91 98765 33331',
      email: 'rahul.delivery@freshbunch.com',
      vehicle_type: 'bike',
      vehicle_number: 'KA-01-EQ-1001',
      city: 'Bangalore',
      service_zone: 'Indiranagar & Central',
      status: 'active'
    },
    {
      name: 'Amit Patel',
      phone: '+91 98765 33332',
      email: 'amit.delivery@freshbunch.com',
      vehicle_type: 'scooter',
      vehicle_number: 'KA-03-MB-2045',
      city: 'Bangalore',
      service_zone: 'Koramangala & HSR',
      status: 'active'
    }
  ];

  for (const boy of deliveryBoysData) {
    const { data: existingBoy } = await supabase.from('delivery_boys').select('id').eq('phone', boy.phone).single();
    if (!existingBoy) {
      await supabase.from('delivery_boys').insert(boy);
    }
  }
  console.log('✓ Delivery fleet seeded');

  // 4. Seed Categories
  console.log('Seeding categories...');
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
    const { data: existingCat } = await supabase.from('categories').select('id').eq('slug', cat.slug).single();
    if (!existingCat) {
      await supabase.from('categories').insert({
        ...cat,
        is_active: 1
      });
    }
  }
  console.log('✓ Categories verified and seeded');

  // Load category map { 'cakes': id, ... }
  const { data: allCategories } = await supabase.from('categories').select('id, slug');
  const catMap = {};
  allCategories.forEach(c => { catMap[c.slug] = c.id; });

  const { data: firstShop } = await supabase.from('shops').select('id').limit(1).single();
  const defaultShopId = firstShop ? firstShop.id : null;

  // 5. Seed Products
  console.log('Seeding products...');
  const productsData = [
    {
      category_id: catMap['cakes'],
      shop_id: defaultShopId,
      name: 'Belgian Dark Chocolate Truffle Cake',
      slug: 'belgian-dark-chocolate-truffle-cake',
      description: 'Layers of decadent 70% pure Belgian dark chocolate ganache encased in silky chocolate glaze and crowned with hand-rolled gold-dusted truffles.',
      short_desc: 'Decadent 70% dark Belgian ganache with golden dusted truffles.',
      base_price: 649,
      discount_price: 549,
      stock_qty: 35,
      sku: 'CK-BEL-001',
      is_active: 1,
      is_featured: 1,
      is_bestseller: 1,
      images_json: [
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        weights: ['0.5kg', '1kg', '1.5kg', '2kg'],
        flavors: ['Classic Belgian Truffle', 'Dark Raspberry Fusion', 'Triple Choco Crunch'],
        eggless_options: ['Eggless (Pure Veg)', 'With Egg'],
        supports_piping_message: true
      }
    },
    {
      category_id: catMap['cakes'],
      shop_id: defaultShopId,
      name: 'Royal Red Velvet Cream Cheese Heart Cake',
      slug: 'royal-red-velvet-heart-cake',
      description: 'Velvety crimson cocoa sponge layered luxuriously with Philadelphia-style tangy vanilla cream cheese frosting in a romantic heart silhouette.',
      short_desc: 'Signature heart-shaped velvet crumb with Philadelphia cream cheese.',
      base_price: 799,
      discount_price: 699,
      stock_qty: 24,
      sku: 'CK-RVL-002',
      is_active: 1,
      is_featured: 1,
      is_bestseller: 1,
      images_json: [
        'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        weights: ['0.5kg', '1kg', '1.5kg'],
        flavors: ['Classic Philadelphia Red Velvet', 'Strawberry Swirl Velvet'],
        eggless_options: ['Eggless (Pure Veg)', 'With Egg'],
        supports_piping_message: true
      }
    },
    {
      category_id: catMap['flowers'],
      shop_id: defaultShopId,
      name: 'Velvet Romance: 24 Crimson Red Dutch Roses',
      slug: '24-crimson-red-dutch-roses',
      description: 'Hand-tied bunch of two dozen long-stemmed premium Dutch red roses wrapped in artisanal Korean kraft paper and tied with a satin ribbon.',
      short_desc: '24 handpicked long-stemmed premium red roses wrapped in matte kraft paper.',
      base_price: 899,
      discount_price: 749,
      stock_qty: 45,
      sku: 'FL-ROS-001',
      is_active: 1,
      is_featured: 1,
      is_bestseller: 1,
      images_json: [
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        stem_counts: [12, 24, 50],
        packaging_types: ['Signature Black Box', 'Artisan Matte Paper Wrap', 'Glass Vase Arrangement']
      }
    },
    {
      category_id: catMap['gift-combos'],
      shop_id: defaultShopId,
      name: 'Midnight Serenade: Truffle Cake & Red Roses Combo',
      slug: 'midnight-serenade-cake-roses-combo',
      description: 'The quintessential celebration pairing: 0.5kg Belgian Dark Truffle Cake accompanied by 12 handpicked Dutch Crimson Roses.',
      short_desc: '0.5kg Belgian Chocolate Cake + 12 Red Roses + Free Message Card.',
      base_price: 1399,
      discount_price: 1199,
      stock_qty: 25,
      sku: 'CB-SER-001',
      is_active: 1,
      is_featured: 1,
      is_bestseller: 1,
      images_json: [
        'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=800&q=80'
      ],
      custom_attributes_schema: {
        weights: ['0.5kg', '1kg'],
        eggless_options: ['Eggless (Pure Veg)', 'With Egg'],
        supports_piping_message: true,
        greeting_card_included: true
      }
    }
  ];

  for (const prod of productsData) {
    if (!prod.category_id) continue;
    const { data: existingProd } = await supabase.from('products').select('id').eq('slug', prod.slug).single();
    if (!existingProd) {
      await supabase.from('products').insert(prod);
    }
  }
  console.log('✓ Products verified and seeded');

  // 6. Seed Delivery Pincodes
  console.log('Seeding pincodes...');
  const pincodesData = [
    { pincode: '560001', area_name: 'MG Road / Brigade', city: 'Bangalore', delivery_charge: 0, min_free_delivery_amount: 499, same_day_cutoff_time: '18:00' },
    { pincode: '560038', area_name: 'Indiranagar / Domlur', city: 'Bangalore', delivery_charge: 0, min_free_delivery_amount: 499, same_day_cutoff_time: '18:30' },
    { pincode: '560034', area_name: 'Koramangala 1-8 Blocks', city: 'Bangalore', delivery_charge: 0, min_free_delivery_amount: 499, same_day_cutoff_time: '18:30' },
    { pincode: '560102', area_name: 'HSR Layout Sectors 1-7', city: 'Bangalore', delivery_charge: 39, min_free_delivery_amount: 599, same_day_cutoff_time: '17:30' },
    { pincode: '560100', area_name: 'Electronic City Phase 1 & 2', city: 'Bangalore', delivery_charge: 49, min_free_delivery_amount: 699, same_day_cutoff_time: '17:00' }
  ];

  for (const p of pincodesData) {
    const { data: existingPin } = await supabase.from('delivery_pincodes').select('id').eq('pincode', p.pincode).single();
    if (!existingPin) {
      await supabase.from('delivery_pincodes').insert({ ...p, is_active: 1 });
    }
  }
  console.log('✓ Delivery pincodes seeded');

  // 7. Seed Delivery Slots
  console.log('Seeding delivery slots...');
  const slotsData = [
    { slot_name: 'Morning Fresh (9:00 AM - 1:00 PM)', start_time: '09:00', end_time: '13:00', slot_charge: 0, max_orders_per_slot: 60 },
    { slot_name: 'Standard Afternoon (1:00 PM - 5:00 PM)', start_time: '13:00', end_time: '17:00', slot_charge: 0, max_orders_per_slot: 60 },
    { slot_name: 'Evening Prime (5:00 PM - 9:00 PM)', start_time: '17:00', end_time: '21:00', slot_charge: 29, max_orders_per_slot: 75 },
    { slot_name: 'Midnight Surprise (11:15 PM - 12:00 AM)', start_time: '23:15', end_time: '00:00', slot_charge: 149, max_orders_per_slot: 35 }
  ];

  for (const s of slotsData) {
    const { data: existingSlot } = await supabase.from('delivery_slots').select('id').eq('slot_name', s.slot_name).single();
    if (!existingSlot) {
      await supabase.from('delivery_slots').insert({ ...s, is_active: 1 });
    }
  }
  console.log('✓ Delivery slots seeded');

  // 8. Seed Coupons
  console.log('Seeding promotional coupons...');
  const couponsData = [
    { code: 'FRESH10', description: '10% Instant Discount on first celebration order', discount_type: 'percentage', discount_value: 10, min_order_value: 499, max_discount_amount: 150 },
    { code: 'SWEET100', description: 'Flat ₹100 Off on Artisanal Cakes above ₹799', discount_type: 'fixed', discount_value: 100, min_order_value: 799, max_discount_amount: 100 }
  ];

  for (const c of couponsData) {
    const { data: existingCoupon } = await supabase.from('coupons').select('id').eq('code', c.code).single();
    if (!existingCoupon) {
      await supabase.from('coupons').insert({ ...c, is_active: 1 });
    }
  }
  console.log('✓ Promotional coupons seeded');

  console.log('\n🎉 ALL SUPABASE TABLES SUCCESSFULLY SEEDED AND VERIFIED!');
}

seedSupabase().catch(err => {
  console.error('Seeding error:', err);
});
