import serverless from 'serverless-http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded before server index is imported
dotenv.config({ path: path.join(__dirname, '..', '..', 'server', '.env') });

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
