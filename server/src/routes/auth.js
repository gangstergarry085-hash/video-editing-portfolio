import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import Joi from 'joi';
import pool from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Rate limit login attempts (generous in development)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 15 : 50,
  validate: { xForwardedForHeader: false, default: false },
  keyGenerator: (req) => {
    return req.headers['x-nf-client-connection-ip'] ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : '') ||
      req.ip ||
      '127.0.0.1';
  },
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).required(),
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { rows } = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (rows.length === 0) {
      return next(createError(401, 'Invalid email or password'));
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.email = user.email;

      res.json({
        user: { id: user.id, email: user.email },
      });
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

const passwordChangeSchema = Joi.object({
  currentPassword: Joi.string().min(1).required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// PUT /api/auth/password — change password (admin)
router.put('/password', requireAuth, validate(passwordChangeSchema), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userId;

    const { rows } = await pool.query(
      'SELECT id, password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (rows.length === 0) {
      return next(createError(404, 'User not found'));
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) {
      return next(createError(400, 'Current password is incorrect'));
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({
    user: { id: req.session.userId, email: req.session.email },
  });
});

export default router;
