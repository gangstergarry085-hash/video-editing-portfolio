import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '..', '..', '..', 'uploads');

/**
 * Local filesystem storage adapter.
 * Stores files in /server/uploads/ and serves via Express static middleware.
 */
export class LocalAdapter {
  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
