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

let booksReady = null;

/**
 * Creates the books tables on first use so no manual migration is needed on Neon.
 * @param {import('pg').Pool} db
 */
export function ensureBookTables(db) {
  if (!booksReady) {
    booksReady = db
      .query(
        `CREATE TABLE IF NOT EXISTS books (
           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
           title text NOT NULL,
           author text NOT NULL DEFAULT '',
           created_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE TABLE IF NOT EXISTS book_words (
           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
           book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
           page integer NOT NULL DEFAULT 1,
           word text NOT NULL,
           meaning text NOT NULL DEFAULT '',
           meaning_gujarati text NOT NULL DEFAULT '',
           created_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS book_words_book_id_idx ON book_words (book_id, page);`,
      )
      .catch((error) => {
        booksReady = null;
        throw error;
      });
  }
  return booksReady;
}
