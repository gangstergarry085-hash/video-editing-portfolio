-- About (singleton row)
CREATE TABLE IF NOT EXISTS about (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Dev Anand',
  role VARCHAR(255) DEFAULT 'Video Editor & Motion Graphics Designer',
  bio TEXT,
  experience VARCHAR(100),
  location VARCHAR(255),
  availability_status VARCHAR(50) DEFAULT 'Available for Projects',
  profile_image_url TEXT,
  social_links JSONB DEFAULT '{}',
  tools JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
