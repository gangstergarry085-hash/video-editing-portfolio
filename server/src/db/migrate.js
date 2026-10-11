import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = typeof import.meta?.url === 'string'
  ? fileURLToPath(import.meta.url)
  : path.join(process.cwd(), 'server/src/db/migrate.js');
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, 'migrations');

async function migrate() {
  const client = await pool.connect();

  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Get already-run migrations
    const { rows: executed } = await client.query(
      'SELECT filename FROM _migrations ORDER BY filename'
    );
    const executedSet = new Set(executed.map((r) => r.filename));

    // Read migration files
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let ran = 0;

    for (const file of files) {
      if (executedSet.has(file)) {
        console.log(`  ✓ ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO _migrations (filename) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`  ✔ ${file} applied`);
        ran++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✗ ${file} FAILED:`, err.message);
        throw err;
      }
    }

    console.log(`\nMigrations complete. ${ran} new migration(s) applied.`);
  } finally {
    client.release();
    await pool.end();
  }
}

console.log('Running migrations...\n');
migrate()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
