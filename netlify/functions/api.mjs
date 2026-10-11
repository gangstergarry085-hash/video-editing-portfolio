import serverless from 'serverless-http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = typeof import.meta?.url === 'string'
  ? fileURLToPath(import.meta.url)
  : path.join(process.cwd(), 'netlify/functions/api.mjs');
const __dirname = path.dirname(__filename);

// Ensure .env is loaded before server index is imported if exists
try {
  dotenv.config({ path: path.join(__dirname, '..', '..', 'server', '.env') });
} catch {}

let serverlessHandler = null;

export const handler = async (event, context) => {
  if (!serverlessHandler) {
    const { default: app } = await import('../../server/src/index.js');
    serverlessHandler = serverless(app, {
      basePath: '/.netlify/functions/api',
    });
  }
  return serverlessHandler(event, context);
};
