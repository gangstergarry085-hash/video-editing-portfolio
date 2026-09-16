import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { getStorage } from '../services/storage/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Multer config — store in memory temporarily, then pass to storage adapter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'video/mp4', 'video/webm', 'video/quicktime',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Accepted: mp4, webm, mov, jpg, png, webp, gif`));
    }
  },
});

// ── Public ────────────────────────────────────────────────

// GET /api/media — list media
router.get('/', async (req, res, next) => {
  try {
    const { type, search } = req.query;
    let query = 'SELECT * FROM media WHERE 1=1';
    const params = [];

    if (type) {
      params.push(`${type}%`);
      query += ` AND mime_type LIKE $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (filename ILIKE $${params.length} OR original_name ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ── Admin ─────────────────────────────────────────────────

// POST /api/media — upload file (admin)
router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, 'No file provided'));
    }

    const storage = getStorage();
    const result = await storage.upload(req.file);

    const { rows } = await pool.query(`
      INSERT INTO media (url, filename, original_name, mime_type, size, storage_key)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [result.url, result.filename, req.file.originalname, req.file.mimetype, req.file.size, result.key]);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/media/:id — delete file (admin, with in-use check)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get the media record
    const { rows: mediaRows } = await pool.query(
      'SELECT * FROM media WHERE id = $1',
      [id]
    );

    if (mediaRows.length === 0) {
      return next(createError(404, 'Media not found'));
    }

    const media = mediaRows[0];

    // Check if media URL is referenced in other tables
    const usageChecks = await Promise.all([
      pool.query(
        'SELECT id, title FROM projects WHERE video_url = $1 OR thumbnail_url = $1 OR mobile_video_url = $1',
        [media.url]
      ),
      pool.query(
        'SELECT id, title FROM before_after WHERE raw_media_url = $1 OR final_media_url = $1 OR thumbnail_url = $1',
        [media.url]
      ),
      pool.query(
        'SELECT id, title FROM showreels WHERE video_url = $1 OR thumbnail_url = $1',
        [media.url]
      ),
      pool.query(
        'SELECT id FROM about WHERE profile_image_url = $1',
        [media.url]
      ),
    ]);

    const usages = [];
    if (usageChecks[0].rows.length > 0) {
      usages.push({ type: 'projects', items: usageChecks[0].rows });
    }
    if (usageChecks[1].rows.length > 0) {
      usages.push({ type: 'before_after', items: usageChecks[1].rows });
    }
    if (usageChecks[2].rows.length > 0) {
      usages.push({ type: 'showreels', items: usageChecks[2].rows });
    }
    if (usageChecks[3].rows.length > 0) {
      usages.push({ type: 'about', items: usageChecks[3].rows });
    }

    // If force=true query param, delete anyway
    if (usages.length > 0 && req.query.force !== 'true') {
      return res.status(409).json({
        error: 'Media is in use',
        usages,
        message: 'This media is referenced by other content. Add ?force=true to delete anyway.',
      });
    }

    // Delete from storage
    const storage = getStorage();
    if (media.storage_key) {
      await storage.delete(media.storage_key);
    }

    // Delete from DB
    await pool.query('DELETE FROM media WHERE id = $1', [id]);

    res.json({ message: 'Media deleted', id: parseInt(id) });
  } catch (err) {
    next(err);
  }
});

export default router;
