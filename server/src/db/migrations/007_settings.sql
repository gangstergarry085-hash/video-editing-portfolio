-- Site settings (singleton row)
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  site_title VARCHAR(255) DEFAULT 'Dev Anand — Video Editor',
  hero_heading VARCHAR(255) DEFAULT 'DEV ANAND',
  hero_subheading TEXT DEFAULT 'VIDEO EDITOR · MOTION DESIGNER · VISUAL STORYTELLER',
  hero_statement TEXT DEFAULT 'YOU WATCH. / I EDIT.',
  availability_status VARCHAR(50) DEFAULT 'Available for Projects',
  accent_color VARCHAR(20) DEFAULT '#E50914',
  email VARCHAR(255),
  social_links JSONB DEFAULT '{}',
  footer_text TEXT DEFAULT '© Dev Anand. All rights reserved.',
  meta_title VARCHAR(255) DEFAULT 'Dev Anand — Video Editor & Motion Designer',
  meta_description TEXT DEFAULT 'Portfolio of Dev Anand — Video Editor, Motion Graphics Designer, and Visual Storyteller.',
  og_image_url TEXT,
  process_steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
