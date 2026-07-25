import { getPool, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { word, meaning, context, moment_of_memory, language, date } = req.body;
    try {
      const result = await db.query(
        'UPDATE vocabulary SET word = $1, meaning = $2, context = $3, moment_of_memory = $4, language = $5, date = $6 WHERE id = $7 RETURNING *',
        [word, meaning, context, moment_of_memory, language, date, id],
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Vocabulary not found.' });
      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      return res.status(500).json({ error: 'Failed to update vocabulary.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM vocabulary WHERE id = $1', [id]);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      return res.status(500).json({ error: 'Failed to delete vocabulary.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
