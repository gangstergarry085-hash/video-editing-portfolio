-- Showreels table with single-active enforcement
CREATE TABLE IF NOT EXISTS showreels (
  id SERIAL PRIMARY KEY,
  video_url TEXT,
  thumbnail_url TEXT,
  title VARCHAR(255),
  description TEXT,
  active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce at most one active showreel via a partial unique index
CREATE UNIQUE INDEX idx_showreels_single_active
  ON showreels (active) WHERE active = TRUE;
