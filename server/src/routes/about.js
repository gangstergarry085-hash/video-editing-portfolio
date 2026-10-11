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
  availability_status: Joi.string().max(50).allow('', null),
  profileImageUrl: Joi.string().allow('', null),
  profile_image_url: Joi.string().allow('', null),
  avatarUrl: Joi.string().allow('', null),
  avatar_url: Joi.string().allow('', null),
  socialLinks: Joi.alternatives().try(Joi.object(), Joi.array()),
  social_links: Joi.alternatives().try(Joi.object(), Joi.array()),
  deliveriesStat: Joi.string().allow('', null),
  deliveries_stat: Joi.string().allow('', null),
  resolutionStat: Joi.string().allow('', null),
  resolution_stat: Joi.string().allow('', null),
  tools: Joi.array(),
}).unknown(true);

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
    const { rows: existingRows } = await pool.query('SELECT * FROM about LIMIT 1');
    const existing = existingRows[0] || {};

    const name = data.name ?? existing.name ?? 'Dev Anand';
    const role = data.role ?? existing.role ?? 'Video Editor & Motion Graphics Designer';
    const bio = data.bio !== undefined ? data.bio : (existing.bio ?? '');
    const experience = data.experience ?? existing.experience ?? '~1 Year';
    const location = data.location ?? existing.location ?? 'India';
    const availabilityStatus = data.availabilityStatus ?? data.availability_status ?? existing.availability_status ?? 'Available for Projects';
    const profileImageUrl = data.profileImageUrl ?? data.profile_image_url ?? data.avatarUrl ?? data.avatar_url ?? existing.profile_image_url ?? null;
    const deliveriesStat = data.deliveriesStat ?? data.deliveries_stat ?? existing.deliveries_stat ?? '100% On-Time';
    const resolutionStat = data.resolutionStat ?? data.resolution_stat ?? existing.resolution_stat ?? '4K / 60FPS HDR';

    let socialLinks;
    if (data.socialLinks !== undefined || data.social_links !== undefined) {
      socialLinks = typeof (data.socialLinks ?? data.social_links) === 'string'
        ? (data.socialLinks ?? data.social_links)
        : JSON.stringify(data.socialLinks ?? data.social_links ?? {});
    } else {
      socialLinks = typeof existing.social_links === 'string'
        ? existing.social_links
        : JSON.stringify(existing.social_links || {});
    }

    let tools;
    if (data.tools !== undefined) {
      tools = typeof data.tools === 'string' ? data.tools : JSON.stringify(data.tools || []);
    } else {
      tools = typeof existing.tools === 'string' ? existing.tools : JSON.stringify(existing.tools || []);
    }

    let result;
    if (existing.id) {
      result = await pool.query(`
        UPDATE about SET
          name = $1, role = $2, bio = $3, experience = $4,
          location = $5, availability_status = $6, profile_image_url = $7,
          social_links = $8, tools = $9, deliveries_stat = $10,
          resolution_stat = $11, updated_at = NOW()
        WHERE id = $12 RETURNING *
      `, [
        name, role, bio, experience,
        location, availabilityStatus, profileImageUrl,
        socialLinks, tools,
        deliveriesStat,
        resolutionStat,
        existing.id,
      ]);
    } else {
      result = await pool.query(`
        INSERT INTO about (
          name, role, bio, experience, location, availability_status,
          profile_image_url, social_links, tools, deliveries_stat, resolution_stat
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
      `, [
        name, role, bio, experience,
        location, availabilityStatus, profileImageUrl,
        socialLinks, tools,
        deliveriesStat,
        resolutionStat,
      ]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
