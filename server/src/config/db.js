import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || '';
const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
const useSsl = (process.env.NODE_ENV === 'production' || dbUrl.includes('sslmode=require') || !isLocal) && dbUrl.length > 0;

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
