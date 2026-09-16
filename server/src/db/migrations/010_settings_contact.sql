-- Add contact heading/subheading and about stats columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS contact_heading TEXT DEFAULT 'Ready to Cut Your Next Masterpiece?';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS contact_subheading TEXT DEFAULT 'Whether you need a dynamic commercial campaign, a high-converting short-form reel, or a nuanced color grade — let''s collaborate.';
ALTER TABLE about ADD COLUMN IF NOT EXISTS deliveries_stat VARCHAR(100) DEFAULT '100% On-Time';
ALTER TABLE about ADD COLUMN IF NOT EXISTS resolution_stat VARCHAR(100) DEFAULT '4K / 60FPS HDR';
