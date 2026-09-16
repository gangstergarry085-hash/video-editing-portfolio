import { Router } from 'express';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const beforeAfterSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  rawMediaUrl: Joi.string().allow('', null),
  finalMediaUrl: Joi.string().allow('', null),
  thumbnailUrl: Joi.string().allow('', null),
  published: Joi.boolean().default(false),
});

// ── Public ────────────────────────────────────────────────

// GET /api/before-after — published entries
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM before_after WHERE published = TRUE ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ── Admin ─────────────────────────────────────────────────

// GET /api/before-after/admin/all
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM before_after ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/before-after
router.post('/', requireAuth, validate(beforeAfterSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const { rows: maxOrder } = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM before_after'
    );

    const { rows } = await pool.query(`
      INSERT INTO before_after (title, description, raw_media_url, final_media_url, thumbnail_url, published, display_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [data.title, data.description, data.rawMediaUrl, data.finalMediaUrl, data.thumbnailUrl, data.published, maxOrder[0].next_order]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/before-after/admin/reorder
router.put('/admin/reorder', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return next(createError(400, 'items must be an array'));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          'UPDATE before_after SET display_order = $1 WHERE id = $2',
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

// PUT /api/before-after/:id
router.put('/:id', requireAuth, validate(beforeAfterSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const { rows } = await pool.query(`
      UPDATE before_after SET
        title = $1, description = $2, raw_media_url = $3,
        final_media_url = $4, thumbnail_url = $5, published = $6, updated_at = NOW()
      WHERE id = $7 RETURNING *
    `, [data.title, data.description, data.rawMediaUrl, data.finalMediaUrl, data.thumbnailUrl, data.published, req.params.id]);

    if (rows.length === 0) return next(createError(404, 'Entry not found'));
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/before-after/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM before_after WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return next(createError(404, 'Entry not found'));
    res.json({ message: 'Deleted', id: rows[0].id });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/before-after/:id/publish
router.patch('/:id/publish', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE before_after SET published = NOT published, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return next(createError(404, 'Entry not found'));
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
