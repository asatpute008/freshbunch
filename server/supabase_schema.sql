-- ========================================================
-- FRESHBUNCH E-COMMERCE PLATFORM - SUPABASE POSTGRES SCHEMA
-- NOTE: Please ensure NO text is highlighted when clicking 'Run'
-- (In Supabase, highlighting text runs ONLY that snippet).
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'active',
  lifecycle_stage TEXT DEFAULT 'lead',
  tags_json JSONB DEFAULT '[]'::jsonb,
  occasions_json JSONB DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  preferred_category TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHOPS / MULTI-VENDOR TABLE
CREATE TABLE IF NOT EXISTS public.shops (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT DEFAULT 'Bangalore',
  status TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  shop_id BIGINT REFERENCES public.shops(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_desc TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  stock_qty INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  sku TEXT UNIQUE NOT NULL,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  is_bestseller INTEGER DEFAULT 0,
  images_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_attributes_schema JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  price_adjustment NUMERIC(10,2) DEFAULT 0,
  stock_qty INTEGER DEFAULT 0,
  sku TEXT
);

-- 6. DELIVERY BOYS / RIDERS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_boys (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  vehicle_type TEXT DEFAULT 'bike',
  vehicle_number TEXT,
  city TEXT DEFAULT 'Bangalore',
  service_zone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2) DEFAULT 0,
  max_discount_amount NUMERIC(10,2),
  start_date DATE,
  expiry_date DATE,
  usage_limit INTEGER DEFAULT 1000,
  times_used INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DELIVERY PINCODES TABLE
CREATE TABLE IF NOT EXISTS public.delivery_pincodes (
  id BIGSERIAL PRIMARY KEY,
  pincode TEXT UNIQUE NOT NULL,
  area_name TEXT NOT NULL,
  city TEXT NOT NULL,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  min_free_delivery_amount NUMERIC(10,2) DEFAULT 500,
  same_day_cutoff_time TEXT DEFAULT '17:00',
  is_active INTEGER DEFAULT 1
);

-- 9. DELIVERY SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.delivery_slots (
  id BIGSERIAL PRIMARY KEY,
  slot_name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_charge NUMERIC(10,2) DEFAULT 0,
  max_orders_per_slot INTEGER DEFAULT 50,
  is_active INTEGER DEFAULT 1
);

-- 10. ORDERS TABLE (Core Fulfillment & Kanban Data)
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  shop_id BIGINT REFERENCES public.shops(id) ON DELETE SET NULL,
  delivery_boy_id BIGINT REFERENCES public.delivery_boys(id) ON DELETE SET NULL,
  delivery_boy_name TEXT,
  guest_info_json JSONB,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  coupon_id BIGINT REFERENCES public.coupons(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'new',
  delivery_pincode TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_slot TEXT NOT NULL,
  special_instructions TEXT,
  cancellation_reason TEXT,
  assigned_staff TEXT DEFAULT 'Bakery Master Chef',
  assigned_rider TEXT DEFAULT 'Express Dispatcher',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  product_image_snapshot TEXT,
  unit_price_snapshot NUMERIC(10,2) NOT NULL,
  discount_price_snapshot NUMERIC(10,2),
  quantity INTEGER NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  customization_details_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CUSTOMER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_verified_purchase INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CRM INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.crm_interactions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
  order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  direction TEXT NOT NULL DEFAULT 'outbound',
  subject TEXT,
  content TEXT NOT NULL,
  created_by TEXT DEFAULT 'Support Team',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CRM TASKS TABLE
CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  customer_id BIGINT,
  customer_name TEXT,
  order_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CRM CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.crm_campaigns (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  target_segment TEXT NOT NULL,
  coupon_code TEXT,
  channel TEXT DEFAULT 'whatsapp',
  message_template TEXT NOT NULL,
  recipients_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. OPTIMAL PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_boy ON public.orders(delivery_boy_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_crm_interactions_user ON public.crm_interactions(user_id);

-- 18. SAFE REALTIME REPLICATION SETUP (Won't fail if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;
