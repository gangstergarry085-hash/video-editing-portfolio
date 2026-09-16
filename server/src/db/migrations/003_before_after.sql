-- Before/After comparison entries
CREATE TABLE IF NOT EXISTS before_after (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  raw_media_url TEXT,
  final_media_url TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_before_after_published ON before_after(published);
CREATE INDEX idx_before_after_display_order ON before_after(display_order);
