import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = typeof import.meta?.url === 'string'
  ? fileURLToPath(import.meta.url)
  : path.join(process.cwd(), 'server/src/services/storage/LocalAdapter.js');
const __dirname = path.dirname(__filename);
const isServerless = Boolean(
  process.env.NETLIFY ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT
);
const UPLOADS_DIR = isServerless
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', '..', '..', 'uploads');

/**
 * Local filesystem storage adapter.
 * Stores files in /server/uploads/ (or /tmp/uploads in serverless) and serves via Express static middleware.
 */
export class LocalAdapter {
  constructor() {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn('Local uploads dir notice:', e.message);
    }
  }

  async upload(file) {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = allowedExts.includes(rawExt) ? rawExt : '.bin';

    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

    return {
      url: `${baseUrl}/uploads/${uniqueName}`,
      filename: uniqueName,
      key: uniqueName,
    };
  }

  async delete(key) {
    if (!key || typeof key !== 'string') return;
    const safeName = path.basename(key);
    const resolvedDir = path.resolve(UPLOADS_DIR);
    const filePath = path.resolve(resolvedDir, safeName);

    // Ensure path traversal is impossible
    if (filePath.startsWith(resolvedDir) && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
