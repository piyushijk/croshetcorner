const fs = require('fs');
const path = require('path');

const write = (filePath, content) => {
  fs.writeFileSync(path.join(__dirname, filePath), content.trim() + '\n', 'utf-8');
};

write('tailwind.config.ts', `
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          blush: "#F2D8D8",
          cream: "#FFF9E6",
          sage: "#D4E0D1",
          terracotta: "#E2A892",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-merriweather)', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
`);

write('src/app/globals.css', `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #FFF9E6; /* pastel cream */
  --foreground: #4A4A4A;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #2a2a2a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure no layout shift for WhatsApp sticky bar */
html {
  scroll-behavior: smooth;
}
`);

write('.env.local', `
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
`);

write('database/schema.sql', `
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
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create custom_inquiries table
CREATE TABLE custom_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  idea_description text NOT NULL,
  preferred_colors text,
  estimated_size text,
  target_date date,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_inquiries ENABLE ROW LEVEL SECURITY;

-- Public can read categories and products
CREATE POLICY "Public profiles are viewable by everyone." ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone." ON products FOR SELECT USING (true);

-- Only authenticated users (admins) can modify
CREATE POLICY "Admins can insert categories." ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update categories." ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete categories." ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert products." ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update products." ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete products." ON products FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can read custom inquiries." ON custom_inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can insert custom inquiries." ON custom_inquiries FOR INSERT WITH CHECK (true);

-- Storage (Create bucket 'product-images' manually in Supabase Dashboard, set to public)
`);

write('database/seed_data.sql', `
-- Insert default categories
INSERT INTO categories (name, slug) VALUES 
('Everlasting Florals', 'florals'),
('Wearables & Everyday Carry', 'wearables'),
('Desk Buddies & Plushies', 'plushies'),
('Home Décor', 'home-decor');

-- Insert seed products
WITH cats AS (SELECT id, slug FROM categories)
INSERT INTO products (slug, title, description, price, category_id, images, lead_time, care_instructions, in_stock, featured)
VALUES
('crochet-tulip-bouquet', 'Everlasting Tulip Bouquet', 'A beautiful set of 3 hand-crocheted tulips. Perfect for gifting and home decor.', 1200, (SELECT id FROM cats WHERE slug = 'florals'), ARRAY['https://images.unsplash.com/photo-1596431976077-6cb56e87d0c7?auto=format&fit=crop&q=80&w=600'], '2-3 days', 'Hand wash gently in cold water.', true, true),
('granny-square-tote', 'Granny Square Tote Bag', 'Vintage style everyday carry tote bag made with soft cotton yarn.', 1800, (SELECT id FROM cats WHERE slug = 'wearables'), ARRAY['https://images.unsplash.com/photo-1620803511130-97ebfae47963?auto=format&fit=crop&q=80&w=600'], '5-7 days', 'Machine wash cold on gentle cycle.', true, true),
('mini-amigurumi-bear', 'Mini Amigurumi Bear', 'Cute little desk buddy for your workspace.', 650, (SELECT id FROM cats WHERE slug = 'plushies'), ARRAY['https://images.unsplash.com/photo-1534067980838-89c0b1156fc7?auto=format&fit=crop&q=80&w=600'], 'In stock', 'Spot clean only.', true, false),
('textured-coaster-set', 'Textured Coaster Set (4)', 'Keep your tables safe with these sage green textured coasters.', 450, (SELECT id FROM cats WHERE slug = 'home-decor'), ARRAY['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=600'], 'In stock', 'Hand wash cold, lay flat to dry.', true, false),
('sunflower-keychain', 'Sunflower Keychain', 'Brighten up your keys with this little sunflower.', 250, (SELECT id FROM cats WHERE slug = 'wearables'), ARRAY['https://images.unsplash.com/photo-1601058269727-4ee416c11d0b?auto=format&fit=crop&q=80&w=600'], 'In stock', 'Spot clean only.', true, false),
('lavender-sprigs', 'Lavender Sprigs (Set of 5)', 'Never wilting lavender sprigs for a calming decor piece.', 850, (SELECT id FROM cats WHERE slug = 'florals'), ARRAY['https://images.unsplash.com/photo-1565545893322-a279540c7743?auto=format&fit=crop&q=80&w=600'], '3-5 days', 'Hand wash gently.', true, true);
`);

write('src/types/index.ts', `
export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  lead_time: string;
  care_instructions: string;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
  categories?: Category; // Joined data
}

export interface CustomInquiry {
  idea_description: string;
  preferred_colors: string;
  estimated_size: string;
  target_date: string;
}
`);

write('src/lib/supabase/client.ts', `
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`);

write('src/lib/supabase/server.ts', `
import { createClient } from '@supabase/supabase-js'

export const createServerSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}
`);

write('src/lib/utils.ts', `
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
`);

write('src/lib/whatsapp.ts', `
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'

export const generateProductWhatsAppLink = (productName: string, price: number, url: string) => {
  const message = \`Hi Crochet Corner 👋\\n\\nI'm interested in ordering:\\n• Product: \${productName}\\n• Price: ₹\${price}\\n• Ref URL: \${url}\\n\\nCould you please confirm current availability and dispatch details?\`
  return \`https://wa.me/\${WA_NUMBER}?text=\${encodeURIComponent(message)}\`
}

export const generateCustomOrderWhatsAppLink = (idea: string, colors: string, size: string, date: string) => {
  const message = \`Hi Crochet Corner 👋\\n\\nI'd like to place a custom crochet commission:\\n• Idea/Item: \${idea}\\n• Preferred Colors: \${colors}\\n• Estimated Size/Qty: \${size}\\n• Target Delivery Date: \${date}\\n\\nHere are my details. Let's discuss feasibility!\`
  return \`https://wa.me/\${WA_NUMBER}?text=\${encodeURIComponent(message)}\`
}
`);

console.log('Setup script part 1 generated.');

