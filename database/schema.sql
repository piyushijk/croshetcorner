-- Create categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  category_id uuid REFERENCES categories(id),
  images text[] DEFAULT '{}'::text[],
  lead_time text,
  care_instructions text,
  in_stock boolean DEFAULT true,
  featured boolean DEFAULT false,
  product_type text DEFAULT 'ready_to_ship',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create custom_inquiries table
CREATE TABLE custom_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  idea_description text NOT NULL,
  preferred_colors text,
  estimated_size text,
  target_date date,
  status text DEFAULT 'New',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create store_settings table
CREATE TABLE store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  free_gift_threshold numeric DEFAULT 1499,
  free_gift_title text DEFAULT 'Free Mystery Crochet Gift',
  free_gift_value_label text DEFAULT 'Worth ₹400',
  is_free_gift_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public profiles are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);
CREATE POLICY "Settings are viewable by everyone." ON store_settings FOR SELECT USING (true);

-- Only authenticated users (admins) can modify
CREATE POLICY "Admins can update settings." ON store_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert settings." ON store_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert categories." ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update categories." ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete categories." ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert products." ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update products." ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete products." ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read custom inquiries." ON custom_inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert custom inquiries." ON custom_inquiries FOR INSERT WITH CHECK (true);

-- Storage (Create bucket 'product-images')
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Performance indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_featured ON products(featured);
