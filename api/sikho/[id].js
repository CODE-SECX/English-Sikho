import { getPool, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { title, description, moment_of_memory, category_id, language, date } = req.body;
    try {
      const result = await db.query(
        'UPDATE sikho SET title = $1, description = $2, moment_of_memory = $3, category_id = $4, language = $5, date = $6 WHERE id = $7 RETURNING *',
        [title, description, moment_of_memory, category_id, language, date, id],
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Sikho entry not found.' });
      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating sikho entry:', error);
      return res.status(500).json({ error: 'Failed to update sikho entry.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM sikho WHERE id = $1', [id]);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting sikho entry:', error);
      return res.status(500).json({ error: 'Failed to delete sikho entry.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
