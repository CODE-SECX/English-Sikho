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
      const { page, word, meaning, meaning_gujarati } = req.body;
      const result = await db.query(
        'UPDATE book_words SET page = $1, word = $2, meaning = $3, meaning_gujarati = $4 WHERE id = $5 RETURNING *',
        [page, word, meaning || '', meaning_gujarati || '', id],
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Word not found.' });
      return res.json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
      await db.query('DELETE FROM book_words WHERE id = $1', [id]);
      return res.status(204).end();
    }
  } catch (error) {
    console.error('Error in book-words/[id]:', error);
    return res.status(500).json({ error: 'Book word request failed.' });
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
