import { Router } from 'express';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const showreelSchema = Joi.object({
  videoUrl: Joi.string().allow('', null),
  video_url: Joi.string().allow('', null),
  thumbnailUrl: Joi.string().allow('', null),
  thumbnail_url: Joi.string().allow('', null),
  title: Joi.string().max(255).allow('', null),
  description: Joi.string().allow('', null),
  active: Joi.boolean(),
  is_active: Joi.boolean(),
  aspectRatio: Joi.string().allow('', null),
  aspect_ratio: Joi.string().allow('', null),
}).unknown(true);

// ── Public ────────────────────────────────────────────────

// GET /api/showreel — active showreel
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM showreels WHERE active = TRUE LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

// ── Admin ─────────────────────────────────────────────────

// GET /api/showreel/admin/all — all showreels
router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM showreels ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/showreel/:id — update showreel
router.put('/:id', requireAuth, validate(showreelSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { rows: existingRows } = await client.query('SELECT * FROM showreels WHERE id = $1', [req.params.id]);
      if (existingRows.length === 0) {
        await client.query('ROLLBACK');
        return next(createError(404, 'Showreel not found'));
      }
      const existing = existingRows[0];

      const vUrl = data.videoUrl ?? data.video_url ?? existing.video_url ?? '';
      const tUrl = data.thumbnailUrl ?? data.thumbnail_url ?? existing.thumbnail_url ?? '';
      const title = data.title ?? existing.title ?? 'The 2024 Reel';
      const desc = data.description !== undefined ? data.description : (existing.description ?? '');
      const isActive = data.active !== undefined || data.is_active !== undefined
        ? Boolean(data.active ?? data.is_active)
        : existing.active;

      // If setting this one to active, deactivate all others first
      if (isActive) {
        await client.query(
          'UPDATE showreels SET active = FALSE WHERE id != $1',
          [req.params.id]
        );
      }

      const { rows } = await client.query(`
        UPDATE showreels SET
          video_url = $1, thumbnail_url = $2, title = $3,
          description = $4, active = $5, updated_at = NOW()
        WHERE id = $6 RETURNING *
      `, [vUrl, tUrl, title, desc, isActive, req.params.id]);

      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return next(createError(404, 'Showreel not found'));
      }

      await client.query('COMMIT');
      res.json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/showreel — create new showreel
router.post('/', requireAuth, validate(showreelSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const vUrl = data.videoUrl ?? data.video_url ?? '';
    const tUrl = data.thumbnailUrl ?? data.thumbnail_url ?? '';
    const title = data.title ?? 'The 2024 Reel';
    const desc = data.description ?? '';
    const isActive = Boolean(data.active ?? data.is_active ?? true);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      if (isActive) {
        await client.query('UPDATE showreels SET active = FALSE');
      }

      const { rows } = await client.query(`
        INSERT INTO showreels (video_url, thumbnail_url, title, description, active)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [vUrl, tUrl, title, desc, isActive]);

      await client.query('COMMIT');
      res.status(201).json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/showreel/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM showreels WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return next(createError(404, 'Showreel not found'));
    res.json({ message: 'Deleted', id: rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;
