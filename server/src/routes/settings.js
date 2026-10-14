import { Router } from 'express';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const settingsSchema = Joi.object({
  siteTitle: Joi.string().max(255).allow('', null),
  site_title: Joi.string().max(255).allow('', null),
  heroHeading: Joi.string().max(255).allow('', null),
  hero_heading: Joi.string().max(255).allow('', null),
  heroSubheading: Joi.string().allow('', null),
  hero_subheading: Joi.string().allow('', null),
  heroStatement: Joi.string().allow('', null),
  hero_statement: Joi.string().allow('', null),
  availabilityStatus: Joi.string().max(50).allow('', null),
  availability_status: Joi.string().max(50).allow('', null),
  accentColor: Joi.string().max(20).allow('', null),
  accent_color: Joi.string().max(20).allow('', null),
  email: Joi.string().email().allow('', null),
  socialLinks: Joi.object(),
  social_links: Joi.object(),
  footerText: Joi.string().allow('', null),
  footer_text: Joi.string().allow('', null),
  metaTitle: Joi.string().max(255).allow('', null),
  meta_title: Joi.string().max(255).allow('', null),
  metaDescription: Joi.string().allow('', null),
  meta_description: Joi.string().allow('', null),
  ogImageUrl: Joi.string().allow('', null),
  og_image_url: Joi.string().allow('', null),
  contactHeading: Joi.string().allow('', null),
  contact_heading: Joi.string().allow('', null),
  contactSubheading: Joi.string().allow('', null),
  contact_subheading: Joi.string().allow('', null),
  whatsappNumber: Joi.string().max(50).allow('', null),
  whatsapp_number: Joi.string().max(50).allow('', null),
  processSteps: Joi.array(),
  process_steps: Joi.array(),
}).unknown(true);

// Ensure column exists gracefully in DB
pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(50) DEFAULT ''").catch(() => {});

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
    const { rows: existingRows } = await pool.query('SELECT * FROM settings LIMIT 1');
    const existing = existingRows[0] || {};

    const siteTitle = data.siteTitle ?? data.site_title ?? existing.site_title ?? 'Dev Anand — Video Editor';
    const heroHeading = data.heroHeading ?? data.hero_heading ?? existing.hero_heading ?? 'DEV ANAND';
    const heroSubheading = data.heroSubheading ?? data.hero_subheading ?? existing.hero_subheading ?? 'VIDEO EDITOR · MOTION DESIGNER · VISUAL STORYTELLER';
    const heroStatement = data.heroStatement ?? data.hero_statement ?? existing.hero_statement ?? 'YOU WATCH. / I EDIT.';
    const availabilityStatus = data.availabilityStatus ?? data.availability_status ?? existing.availability_status ?? 'Available for Projects';
    const accentColor = data.accentColor ?? data.accent_color ?? existing.accent_color ?? '#E50914';
    const email = data.email ?? existing.email ?? 'admin@devanand.com';
    const footerText = data.footerText ?? data.footer_text ?? existing.footer_text ?? '© Dev Anand. All rights reserved.';
    const metaTitle = data.metaTitle ?? data.meta_title ?? existing.meta_title ?? 'Dev Anand — Video Editor & Motion Designer';
    const metaDescription = data.metaDescription ?? data.meta_description ?? existing.meta_description ?? 'Portfolio of Dev Anand — Video Editor, Motion Graphics Designer, and Visual Storyteller.';
    const ogImageUrl = data.ogImageUrl ?? data.og_image_url ?? existing.og_image_url ?? null;
    const contactHeading = data.contactHeading ?? data.contact_heading ?? existing.contact_heading ?? 'Ready to Cut Your Next Masterpiece?';
    const contactSubheading = data.contactSubheading ?? data.contact_subheading ?? existing.contact_subheading ?? "Whether you need a dynamic commercial campaign, a high-converting short-form reel, or a nuanced color grade — let's collaborate.";
    const whatsappNumber = data.whatsappNumber ?? data.whatsapp_number ?? existing.whatsapp_number ?? '';

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

    let processSteps;
    if (data.processSteps !== undefined || data.process_steps !== undefined) {
      processSteps = typeof (data.processSteps ?? data.process_steps) === 'string'
        ? (data.processSteps ?? data.process_steps)
        : JSON.stringify(data.processSteps ?? data.process_steps ?? []);
    } else {
      processSteps = typeof existing.process_steps === 'string'
        ? existing.process_steps
        : JSON.stringify(existing.process_steps || []);
    }

    let result;
    if (existing.id) {
      result = await pool.query(`
        UPDATE settings SET
          site_title = $1, hero_heading = $2, hero_subheading = $3,
          hero_statement = $4, availability_status = $5, accent_color = $6,
          email = $7, social_links = $8, footer_text = $9,
          meta_title = $10, meta_description = $11, og_image_url = $12,
          process_steps = $13, contact_heading = $14, contact_subheading = $15,
          whatsapp_number = $16,
          updated_at = NOW()
        WHERE id = $17 RETURNING *
      `, [
        siteTitle, heroHeading, heroSubheading,
        heroStatement, availabilityStatus, accentColor,
        email, socialLinks, footerText,
        metaTitle, metaDescription, ogImageUrl,
        processSteps,
        contactHeading,
        contactSubheading,
        whatsappNumber,
        existing.id,
      ]);
    } else {
      result = await pool.query(`
        INSERT INTO settings (
          site_title, hero_heading, hero_subheading, hero_statement,
          availability_status, accent_color, email, social_links,
          footer_text, meta_title, meta_description, og_image_url,
          process_steps, contact_heading, contact_subheading, whatsapp_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *
      `, [
        siteTitle, heroHeading, heroSubheading,
        heroStatement, availabilityStatus, accentColor,
        email, socialLinks, footerText,
        metaTitle, metaDescription, ogImageUrl,
        processSteps,
        contactHeading,
        contactSubheading,
        whatsappNumber,
      ]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
