import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

let serverInstance = null;

export async function ensureLocalDb() {
  if (process.env.NODE_ENV === 'production') return;

  const dbUrl = process.env.DATABASE_URL || '';
  const isLocalUrl = dbUrl.includes('localhost:5432') || dbUrl.includes('127.0.0.1:5432');
  if (!isLocalUrl) return;

  const open = await isPortOpen(5432);
  if (open) return;

  console.log('⚡ Starting embedded PostgreSQL server on port 5432...');
  const { PGlite } = await import('@electric-sql/pglite');
  const { createServer } = await import('pglite-server');

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const dataDir = path.join(__dirname, '..', '..', '.pglite_data');

  const db = new PGlite(dataDir);
  await db.waitReady;

  serverInstance = createServer(db);
  await new Promise((resolve) => {
    serverInstance.listen(5432, () => {
      console.log('✔ Embedded PostgreSQL server active on port 5432.');
      resolve();
    });
  });
}
