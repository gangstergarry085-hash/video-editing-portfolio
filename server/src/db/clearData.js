import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = typeof import.meta?.url === 'string'
  ? fileURLToPath(import.meta.url)
  : path.join(process.cwd(), 'server/src/db/clearData.js');
const __dirname = path.dirname(__filename);

// Ensure .env from server directory is loaded first
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config(); // fallback

async function clearData() {
  const { default: pool } = await import('../config/db.js');
  const client = await pool.connect();

  try {
    console.log('--- Cleaning previous portfolio data from database ---');

    // 1. Clear projects
    const { rowCount: projectsDeleted } = await client.query('DELETE FROM projects');
    console.log(`✔ Cleared ${projectsDeleted} project(s)`);

    // 2. Clear showreels
    const { rowCount: showreelsDeleted } = await client.query('DELETE FROM showreels');
    console.log(`✔ Cleared ${showreelsDeleted} showreel(s)`);

    // 3. Clear before_after
    const { rowCount: baDeleted } = await client.query('DELETE FROM before_after');
    console.log(`✔ Cleared ${baDeleted} before/after comparison(s)`);

    // 4. Clear media library
    const { rowCount: mediaDeleted } = await client.query('DELETE FROM media');
    console.log(`✔ Cleared ${mediaDeleted} media item(s)`);

    // Reset sequence counters so new project starts with ID 1
    await client.query(`
      ALTER SEQUENCE IF EXISTS projects_id_seq RESTART WITH 1;
      ALTER SEQUENCE IF EXISTS showreels_id_seq RESTART WITH 1;
      ALTER SEQUENCE IF EXISTS before_after_id_seq RESTART WITH 1;
      ALTER SEQUENCE IF EXISTS media_id_seq RESTART WITH 1;
    `);

    console.log('\n✔ All previous portfolio data has been successfully deleted.');
    console.log('✔ Admin user and system settings are intact.');
    console.log('✔ The database is completely ready for your new project(s)!');
  } catch (err) {
    console.error('Error clearing database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

clearData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to clear data:', err);
    process.exit(1);
  });
