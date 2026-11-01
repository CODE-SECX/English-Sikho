import { getPool, setCors, ensureBookTables } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  const { id } = req.query;

  try {
    await ensureBookTables(db);

    if (req.method === 'PUT') {
      const { title, author } = req.body;
      const result = await db.query(
        'UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *',
        [title, author || '', id],
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
      return res.json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      await db.query('DELETE FROM books WHERE id = $1', [id]);
      return res.status(204).end();
    }
  } catch (error) {
    console.error('Error in books/[id]:', error);
    return res.status(500).json({ error: 'Book request failed.' });
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
