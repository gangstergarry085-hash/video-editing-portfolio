import { Router } from 'express';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

const serviceSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  published: Joi.boolean().default(true),
});

// ── Public ────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM services WHERE published = TRUE ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ── Admin ─────────────────────────────────────────────────

router.get('/admin/all', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM services ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireAuth, validate(serviceSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const { rows: maxOrder } = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 AS next_order FROM services'
    );

    const { rows } = await pool.query(
      'INSERT INTO services (name, description, published, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.description, data.published, maxOrder[0].next_order]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/services/admin/reorder
router.put('/admin/reorder', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return next(createError(400, 'items must be an array'));

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const item of items) {
        await client.query(
          'UPDATE services SET display_order = $1 WHERE id = $2',
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

router.put('/:id', requireAuth, validate(serviceSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const { rows } = await pool.query(
      'UPDATE services SET name = $1, description = $2, published = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [data.name, data.description, data.published, req.params.id]
    );

    if (rows.length === 0) return next(createError(404, 'Service not found'));
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM services WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (rows.length === 0) return next(createError(404, 'Service not found'));
    res.json({ message: 'Deleted', id: rows[0].id });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/publish', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE services SET published = NOT published, updated_at = NOW() WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return next(createError(404, 'Service not found'));
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
