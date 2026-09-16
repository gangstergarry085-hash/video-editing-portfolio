-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL
    CHECK (category IN (
      'Cinematic', 'Motion Graphics', 'Social Media',
      'YouTube', 'Advertisement', 'Client Work', 'Personal Experiment'
    )),
  description TEXT,
  short_description VARCHAR(500),
  video_url TEXT,
  thumbnail_url TEXT,
  mobile_video_url TEXT,
  tools TEXT[] DEFAULT '{}',
  client_name VARCHAR(255),
  client_description TEXT,
  dev_role VARCHAR(255),
  services_provided TEXT[] DEFAULT '{}',
  project_year INTEGER,
  project_type VARCHAR(100),
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_published ON projects(published);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_display_order ON projects(display_order);
