import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import pool from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import beforeAfterRoutes from './routes/beforeAfter.js';
import showreelRoutes from './routes/showreel.js';
import serviceRoutes from './routes/services.js';
import aboutRoutes from './routes/about.js';
import settingsRoutes from './routes/settings.js';
import mediaRoutes from './routes/media.js';

import rateLimit from 'express-rate-limit';

dotenv.config();

const __filename = typeof import.meta?.url === 'string'
  ? fileURLToPath(import.meta.url)
  : path.join(process.cwd(), 'server/src/index.js');
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Disable server header identification
app.disable('x-powered-by');

// Trust reverse proxies (Netlify, Render, Heroku) for secure cookies
app.set('trust proxy', 1);

// ── Security ──────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.URL,              // Netlify primary site URL (e.g. https://site.netlify.app)
  process.env.DEPLOY_PRIME_URL, // Netlify deploy preview URL
  process.env.DEPLOY_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean).map((u) => u.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or same-origin requests with no origin header
    if (!origin) return callback(null, true);
    const clean = origin.replace(/\/$/, '');
    let isNetlify = false;
    try {
      isNetlify = /\.netlify\.app$/.test(new URL(origin).hostname);
    } catch {
      isNetlify = false;
    }

    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(clean) ||
      isNetlify
    ) {
      return callback(null, true);
    }
    // Reject unauthorized cross-origin requests
    return callback(null, false);
  },
  credentials: true,
}));

// Global rate limiting for API endpoints (protect against abuse & scraping)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  keyGenerator: (req) => {
    return req.headers['x-nf-client-connection-ip'] ||
      (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : '') ||
      req.ip ||
      '127.0.0.1';
  },
  message: { error: 'Too many requests, please try again later.' },
});

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use(apiLimiter);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/before-after', beforeAfterRoutes);
apiRouter.use('/showreel', showreelRoutes);
apiRouter.use('/services', serviceRoutes);
apiRouter.use('/about', aboutRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount on /api (standard local & Netlify redirect path)
app.use('/api', apiRouter);
// Mount as fallback (in case serverless-http basePath strips /api)
app.use(apiRouter);

// ── Error handler (must be last) ──────────────────────────
app.use(errorHandler);

// ── Start (only when run directly, not when imported by Netlify function) ──
const isServerless = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT ||
  (process.argv[1] && process.argv[1].includes('netlify'))
);

const isDirectRun = !isServerless && process.argv[1] && (
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(__filename).toLowerCase()
);

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
