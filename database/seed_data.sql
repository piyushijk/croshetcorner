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
