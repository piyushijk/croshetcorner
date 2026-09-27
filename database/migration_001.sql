-- ============================================================
-- Crochet Corner — Production Master Database Migration
-- Safe & idempotent: Run anytime in Supabase Dashboard → SQL Editor → Run
-- Project ID: flfxswxvgmsjkafgcpvs
-- ============================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text UNIQUE NOT NULL,
  created_at  timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Ensure all columns exist on categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc', now());

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               text UNIQUE NOT NULL,
  title              text NOT NULL,
  description        text,
  price              numeric NOT NULL,
  category_id        uuid,
  images             text[] DEFAULT '{}'::text[],
  lead_time          text,
  care_instructions  text,
  in_stock           boolean DEFAULT true,
  featured           boolean DEFAULT false,
  product_type       text DEFAULT 'ready_to_ship',
  created_at         timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS care_instructions text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock boolean DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'ready_to_ship';
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc', now());

-- Relax NOT NULL on 'name' if legacy schema had it required
DO $$ BEGIN
  ALTER TABLE products ALTER COLUMN name DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Safe Foreign Key Constraint for products.category_id -> categories.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'products_category_id_fkey' AND table_name = 'products'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. CUSTOM INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS custom_inquiries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text,
  customer_name    text,
  phone            text NOT NULL,
  idea_description text NOT NULL,
  preferred_colors text,
  estimated_size   text,
  target_date      date,
  notes            text,
  status           text DEFAULT 'New',
  created_at       timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Ensure all columns exist on custom_inquiries
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS customer_name text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS idea_description text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS preferred_colors text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS estimated_size text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS target_date date;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS status text DEFAULT 'New';
ALTER TABLE custom_inquiries ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT timezone('utc', now());

-- 4. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  free_gift_threshold   numeric DEFAULT 1499,
  free_gift_title       text DEFAULT 'Free Mystery Crochet Gift',
  free_gift_value_label text DEFAULT 'Worth ₹400',
  is_free_gift_active   boolean DEFAULT true,
  updated_at            timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

-- Ensure all columns exist on store_settings
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS free_gift_threshold numeric DEFAULT 1499;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS free_gift_title text DEFAULT 'Free Mystery Crochet Gift';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS free_gift_value_label text DEFAULT 'Worth ₹400';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS is_free_gift_active boolean DEFAULT true;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc', now());

-- 5. SEED INITIAL DATA (Only if empty)
-- Seed default categories if none exist
INSERT INTO categories (name, slug)
VALUES 
  ('Florals', 'florals'),
  ('Wearables & Bags', 'wearables'),
  ('Plushies', 'plushies'),
  ('Decor', 'decor')
ON CONFLICT (slug) DO NOTHING;

-- Seed default store settings if none exist
INSERT INTO store_settings (free_gift_threshold, free_gift_title, free_gift_value_label, is_free_gift_active)
SELECT 1499, 'Free Mystery Crochet Gift', 'Worth ₹400', true
WHERE NOT EXISTS (SELECT 1 FROM store_settings LIMIT 1);

-- ============================================================
-- 6. PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- Enables full read/write for both anonymous & authenticated users
-- so the Next.js Admin Console works seamlessly with zero friction.
-- ============================================================

ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products         ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_inquiries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings   ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public read categories" ON categories;
DROP POLICY IF EXISTS "Auth insert categories" ON categories;
DROP POLICY IF EXISTS "Auth update categories" ON categories;
DROP POLICY IF EXISTS "Auth delete categories" ON categories;
DROP POLICY IF EXISTS "Enable all access for categories" ON categories;
CREATE POLICY "Enable all access for categories" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Auth insert products" ON products;
DROP POLICY IF EXISTS "Auth update products" ON products;
DROP POLICY IF EXISTS "Auth delete products" ON products;
DROP POLICY IF EXISTS "Enable all access for products" ON products;
CREATE POLICY "Enable all access for products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public read settings" ON store_settings;
DROP POLICY IF EXISTS "Auth update settings" ON store_settings;
DROP POLICY IF EXISTS "Auth insert settings" ON store_settings;
DROP POLICY IF EXISTS "Enable all access for store_settings" ON store_settings;
CREATE POLICY "Enable all access for store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone insert inquiries" ON custom_inquiries;
DROP POLICY IF EXISTS "Auth read inquiries" ON custom_inquiries;
DROP POLICY IF EXISTS "Auth update inquiries" ON custom_inquiries;
DROP POLICY IF EXISTS "Enable all access for custom_inquiries" ON custom_inquiries;
CREATE POLICY "Enable all access for custom_inquiries" ON custom_inquiries FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 7. SUPABASE STORAGE BUCKET: product-images
-- Creates the public storage bucket and sets permissive policies
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete product-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all for product-images" ON storage.objects;

CREATE POLICY "Allow all for product-images" ON storage.objects
  FOR ALL
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- ============================================================
-- 8. GRANT PRIVILEGES TO POSTGREST ROLES
-- Ensures schema cache exposes all tables and columns to anon and authenticated
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- 9. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at  ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured     ON products(featured);

-- ============================================================
-- SUCCESS: Database is fully aligned with Next.js Admin Console!
-- Remember to click "Reload schema cache" in Supabase -> Settings -> API.
-- ============================================================
