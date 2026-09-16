import { Router } from 'express';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const settingsSchema = Joi.object({
  siteTitle: Joi.string().max(255).allow('', null),
  heroHeading: Joi.string().max(255).allow('', null),
  heroSubheading: Joi.string().allow('', null),
  heroStatement: Joi.string().allow('', null),
  availabilityStatus: Joi.string().max(50).allow('', null),
  accentColor: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  socialLinks: Joi.object().default({}),
  footerText: Joi.string().allow('', null),
  metaTitle: Joi.string().max(255).allow('', null),
  metaDescription: Joi.string().allow('', null),
  ogImageUrl: Joi.string().allow('', null),
  contactHeading: Joi.string().allow('', null),
  contactSubheading: Joi.string().allow('', null),
  processSteps: Joi.array().items(
    Joi.object({
      step: Joi.number().integer().required(),
      title: Joi.string().allow('', null),
      description: Joi.string().allow('', null),
      track: Joi.string().allow('', null),
      node: Joi.string().allow('', null),
      label: Joi.string().allow('', null),
    }).unknown(true)
  ).default([]),
});

// GET /api/settings — public
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM settings LIMIT 1');
    res.json(rows[0] || null);
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings — admin
router.put('/', requireAuth, validate(settingsSchema), async (req, res, next) => {
  try {
    const data = req.body;

    const { rows: existing } = await pool.query('SELECT id FROM settings LIMIT 1');

    let result;
    if (existing.length > 0) {
      result = await pool.query(`
        UPDATE settings SET
          site_title = $1, hero_heading = $2, hero_subheading = $3,
          hero_statement = $4, availability_status = $5, accent_color = $6,
          email = $7, social_links = $8, footer_text = $9,
          meta_title = $10, meta_description = $11, og_image_url = $12,
          process_steps = $13, contact_heading = $14, contact_subheading = $15,
          updated_at = NOW()
        WHERE id = $16 RETURNING *
      `, [
        data.siteTitle, data.heroHeading, data.heroSubheading,
        data.heroStatement, data.availabilityStatus, data.accentColor,
        data.email, JSON.stringify(data.socialLinks), data.footerText,
        data.metaTitle, data.metaDescription, data.ogImageUrl,
        JSON.stringify(data.processSteps),
        data.contactHeading || 'Ready to Cut Your Next Masterpiece?',
        data.contactSubheading || "Whether you need a dynamic commercial campaign, a high-converting short-form reel, or a nuanced color grade — let's collaborate.",
        existing[0].id,
      ]);
    } else {
      result = await pool.query(`
        INSERT INTO settings (
          site_title, hero_heading, hero_subheading, hero_statement,
          availability_status, accent_color, email, social_links,
          footer_text, meta_title, meta_description, og_image_url,
          process_steps, contact_heading, contact_subheading
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *
      `, [
        data.siteTitle, data.heroHeading, data.heroSubheading,
        data.heroStatement, data.availabilityStatus, data.accentColor,
        data.email, JSON.stringify(data.socialLinks), data.footerText,
        data.metaTitle, data.metaDescription, data.ogImageUrl,
        JSON.stringify(data.processSteps),
        data.contactHeading || 'Ready to Cut Your Next Masterpiece?',
        data.contactSubheading || "Whether you need a dynamic commercial campaign, a high-converting short-form reel, or a nuanced color grade — let's collaborate.",
      ]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
