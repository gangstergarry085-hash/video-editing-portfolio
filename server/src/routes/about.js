import { Router } from 'express';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const aboutSchema = Joi.object({
  name: Joi.string().max(255).allow('', null),
  role: Joi.string().max(255).allow('', null),
  bio: Joi.string().allow('', null),
  experience: Joi.string().max(100).allow('', null),
  location: Joi.string().max(255).allow('', null),
  availabilityStatus: Joi.string().max(50).allow('', null),
  profileImageUrl: Joi.string().allow('', null),
  socialLinks: Joi.object().default({}),
  deliveriesStat: Joi.string().allow('', null),
  resolutionStat: Joi.string().allow('', null),
  tools: Joi.array().items(
    Joi.alternatives().try(
      Joi.string(),
      Joi.object({
        name: Joi.string().required(),
        category: Joi.string().allow('', null),
      }).unknown(true)
    )
  ).default([]),
});

// GET /api/about — public
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM about LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

// PUT /api/about — admin
router.put('/', requireAuth, validate(aboutSchema), async (req, res, next) => {
  try {
    const data = req.body;

    // Upsert: update existing or insert if none exists
    const { rows: existing } = await pool.query('SELECT id FROM about LIMIT 1');

    let result;
    if (existing.length > 0) {
      result = await pool.query(`
        UPDATE about SET
          name = $1, role = $2, bio = $3, experience = $4,
          location = $5, availability_status = $6, profile_image_url = $7,
          social_links = $8, tools = $9, deliveries_stat = $10,
          resolution_stat = $11, updated_at = NOW()
        WHERE id = $12 RETURNING *
      `, [
        data.name, data.role, data.bio, data.experience,
        data.location, data.availabilityStatus, data.profileImageUrl,
        JSON.stringify(data.socialLinks), JSON.stringify(data.tools),
        data.deliveriesStat || '100% On-Time',
        data.resolutionStat || '4K / 60FPS HDR',
        existing[0].id,
      ]);
    } else {
      result = await pool.query(`
        INSERT INTO about (
          name, role, bio, experience, location, availability_status,
          profile_image_url, social_links, tools, deliveries_stat, resolution_stat
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
      `, [
        data.name, data.role, data.bio, data.experience,
        data.location, data.availabilityStatus, data.profileImageUrl,
        JSON.stringify(data.socialLinks), JSON.stringify(data.tools),
        data.deliveriesStat || '100% On-Time',
        data.resolutionStat || '4K / 60FPS HDR',
      ]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
