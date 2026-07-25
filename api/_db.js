import pg from 'pg';

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_URL;

let pool = null;

/**
 * Returns the shared pool, or sends a 500 and returns null if not configured.
 * @param {import('http').ServerResponse} res
 */
export function getPool(res) {
  if (!connectionString) {
    res.status(500).json({ error: 'Database connection string is not configured.' });
    return null;
  }
  if (!pool) {
    pool = new Pool({ connectionString });
  }
  return pool;
}

/**
 * Sets CORS headers so Vercel preview URLs can call the API.
 * @param {import('http').ServerResponse} res
 */
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
