import { getPool, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  if (req.method === 'GET') {
    try {
      const result = await db.query('SELECT * FROM vocabulary ORDER BY created_at DESC');
      return res.json(result.rows);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      return res.status(500).json({ error: 'Failed to fetch vocabulary.' });
    }
  }

  if (req.method === 'POST') {
    const { word, meaning, context, moment_of_memory, language, date } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO vocabulary (word, meaning, context, moment_of_memory, language, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [word, meaning, context, moment_of_memory, language, date],
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating vocabulary:', error);
      return res.status(500).json({ error: 'Failed to create vocabulary.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
