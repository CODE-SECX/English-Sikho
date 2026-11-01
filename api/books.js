import { getPool, setCors, ensureBookTables } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  try {
    await ensureBookTables(db);

    if (req.method === 'GET') {
      const result = await db.query('SELECT * FROM books ORDER BY created_at DESC');
      return res.json(result.rows);
    }

    if (req.method === 'POST') {
      const { title, author } = req.body;
      const result = await db.query(
        'INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *',
        [title, author || ''],
      );
      return res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error in books:', error);
    return res.status(500).json({ error: 'Books request failed.' });
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
