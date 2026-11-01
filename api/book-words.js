import { getPool, setCors, ensureBookTables } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  try {
    await ensureBookTables(db);

    if (req.method === 'GET') {
      const result = await db.query('SELECT * FROM book_words ORDER BY page, created_at');
      return res.json(result.rows);
    }

    // Bulk insert: body is an array of { book_id, page, word, meaning, meaning_gujarati }
    if (req.method === 'POST') {
      const rows = Array.isArray(req.body) ? req.body : [req.body];
      if (rows.length === 0) return res.json([]);
      const params = [];
      const values = rows.map((row, i) => {
        params.push(row.book_id, row.page, row.word, row.meaning || '', row.meaning_gujarati || '');
        const n = i * 5;
        return `($${n + 1}, $${n + 2}, $${n + 3}, $${n + 4}, $${n + 5})`;
      });
      const result = await db.query(
        `INSERT INTO book_words (book_id, page, word, meaning, meaning_gujarati) VALUES ${values.join(', ')} RETURNING *`,
        params,
      );
      return res.status(201).json(result.rows);
    }
  } catch (error) {
    console.error('Error in book-words:', error);
    return res.status(500).json({ error: 'Book words request failed.' });
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
