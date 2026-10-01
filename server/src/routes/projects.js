import { Router } from 'express';
import Joi from 'joi';
import slugify from 'slugify';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const CATEGORIES = [
  'Cinematic', 'Motion Graphics', 'Social Media',
  'YouTube', 'Advertisement', 'Client Work', 'Personal Experiment',
];

const projectSchema = Joi.object({
  title: Joi.string().max(255).required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  description: Joi.string().allow('', null),
  shortDescription: Joi.string().max(500).allow('', null),
  videoUrl: Joi.string().allow('', null),
  thumbnailUrl: Joi.string().allow('', null),
  mobileVideoUrl: Joi.string().allow('', null),
  tools: Joi.array().items(Joi.string()).default([]),
  clientName: Joi.string().max(255).allow('', null),
  clientDescription: Joi.string().allow('', null),
  devRole: Joi.string().max(255).allow('', null),
  servicesProvided: Joi.array().items(Joi.string()).default([]),
  projectYear: Joi.number().integer().min(2000).max(2100).allow(null),
  projectType: Joi.string().max(100).allow('', null),
  featured: Joi.boolean().default(false),
  published: Joi.boolean().default(false),
});

// Helper: generate unique slug
async function generateSlug(title, excludeId = null) {
  let slug = slugify(title, { lower: true, strict: true });
  let suffix = 0;
  let candidate = slug;

  while (true) {
    const query = excludeId
      ? 'SELECT id FROM projects WHERE slug = $1 AND id != $2'
      : 'SELECT id FROM projects WHERE slug = $1';
    const params = excludeId ? [candidate, excludeId] : [candidate];
    const { rows } = await pool.query(query, params);

    if (rows.length === 0) return candidate;
    suffix++;
    candidate = `${slug}-${suffix}`;
  }
}

// ── Admin routes (MUST be defined before /:slug and /:id) ────────────

// GET /api/projects/admin/all — all projects (admin)
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const { search, category, status, sort } = req.query;
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (status === 'published') {
      query += ' AND published = TRUE';
    } else if (status === 'draft') {
      query += ' AND published = FALSE';
    }

    if (sort === 'newest') {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY display_order ASC, created_at DESC';
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/admin/stats — dashboard stats
router.get('/admin/stats', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE published = TRUE)::int AS published,
        COUNT(*) FILTER (WHERE published = FALSE)::int AS draft,
        COUNT(*) FILTER (WHERE featured = TRUE)::int AS featured,
        COUNT(*) FILTER (WHERE category = 'Client Work')::int AS client_projects
      FROM projects
    `);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/admin/:id — single project by ID (admin)
router.get('/admin/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return next(createError(404, 'Project not found'));
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/admin/reorder — batch reorder (admin, before /:id)
router.put('/admin/reorder', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body; // [{ id, displayOrder }]

    if (!Array.isArray(items)) {
      return next(createError(400, 'items must be an array'));
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          'UPDATE projects SET display_order = $1, updated_at = NOW() WHERE id = $2',
          [item.displayOrder, item.id]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ message: 'Reorder saved' });
  } catch (err) {
    next(err);
  }
});

// ── Public routes ─────────────────────────────────────────

// GET /api/projects — published projects for public site
router.get('/', async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    let query = 'SELECT * FROM projects WHERE published = TRUE';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (featured === 'true') {
      query += ' AND featured = TRUE';
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:slug — single published project
router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM projects WHERE slug = $1 AND published = TRUE',
      [req.params.slug]
    );

    if (rows.length === 0) {
      return next(createError(404, 'Project not found'));
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects — create project (admin)
router.post('/', requireAuth, validate(projectSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const slug = await generateSlug(data.title);

    // Get max display_order
    const { rows: maxOrder } = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM projects'
    );

    const { rows } = await pool.query(`
      INSERT INTO projects (
        title, slug, category, description, short_description,
        video_url, thumbnail_url, mobile_video_url,
        tools, client_name, client_description, dev_role,
        services_provided, project_year, project_type,
        featured, published, display_order
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `, [
      data.title, slug, data.category, data.description, data.shortDescription,
      data.videoUrl, data.thumbnailUrl, data.mobileVideoUrl,
      data.tools, data.clientName, data.clientDescription, data.devRole,
      data.servicesProvided, data.projectYear, data.projectType,
      data.featured, data.published, maxOrder[0].next_order,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/projects/:id — update project (admin)
router.put('/:id', requireAuth, validate(projectSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const slug = await generateSlug(data.title, id);

    const { rows } = await pool.query(`
      UPDATE projects SET
        title = $1, slug = $2, category = $3, description = $4,
        short_description = $5, video_url = $6, thumbnail_url = $7,
        mobile_video_url = $8, tools = $9, client_name = $10,
        client_description = $11, dev_role = $12, services_provided = $13,
        project_year = $14, project_type = $15, featured = $16,
        published = $17, updated_at = NOW()
      WHERE id = $18
      RETURNING *
    `, [
      data.title, slug, data.category, data.description, data.shortDescription,
      data.videoUrl, data.thumbnailUrl, data.mobileVideoUrl,
      data.tools, data.clientName, data.clientDescription, data.devRole,
      data.servicesProvided, data.projectYear, data.projectType,
      data.featured, data.published, id,
    ]);

    if (rows.length === 0) {
      return next(createError(404, 'Project not found'));
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id — delete project (admin)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM projects WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (rows.length === 0) {
      return next(createError(404, 'Project not found'));
    }

    res.json({ message: 'Project deleted', id: rows[0].id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/publish — toggle publish (admin)
router.patch('/:id/publish', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      UPDATE projects SET published = NOT published, updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [req.params.id]);

    if (rows.length === 0) {
      return next(createError(404, 'Project not found'));
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id/feature — toggle featured (admin)
router.patch('/:id/feature', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      UPDATE projects SET featured = NOT featured, updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [req.params.id]);

    if (rows.length === 0) {
      return next(createError(404, 'Project not found'));
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/:id/duplicate — duplicate project (admin)
router.post('/:id/duplicate', requireAuth, async (req, res, next) => {
  try {
    const { rows: original } = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [req.params.id]
    );

    if (original.length === 0) {
      return next(createError(404, 'Project not found'));
    }

    const src = original[0];
    const slug = await generateSlug(`${src.title} Copy`);

    const { rows: maxOrder } = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM projects'
    );

    const { rows } = await pool.query(`
      INSERT INTO projects (
        title, slug, category, description, short_description,
        video_url, thumbnail_url, mobile_video_url,
        tools, client_name, client_description, dev_role,
        services_provided, project_year, project_type,
        featured, published, display_order
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, FALSE, FALSE, $16
      ) RETURNING *
    `, [
      `${src.title} (Copy)`, slug, src.category, src.description, src.short_description,
      src.video_url, src.thumbnail_url, src.mobile_video_url,
      src.tools, src.client_name, src.client_description, src.dev_role,
      src.services_provided, src.project_year, src.project_type,
      maxOrder[0].next_order,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
