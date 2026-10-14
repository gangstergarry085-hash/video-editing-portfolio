-- Expand category constraint to support 3 primary showcase categories:
-- 'Client & Case Stories', 'High-Retention Reels', 'Commercial & Promos'
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE projects ADD CONSTRAINT projects_category_check
  CHECK (category IN (
    'Client & Case Stories', 'High-Retention Reels', 'Commercial & Promos',
    'Cinematic', 'Motion Graphics', 'Social Media',
    'YouTube', 'Advertisement', 'Client Work', 'Personal Experiment'
  ));
