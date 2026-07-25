import { getPool, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  const { id } = req.query;

  if (req.method === 'PUT') {
    const { name, description, color } = req.body;
    try {
      const result = await db.query(
        'UPDATE categories SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *',
        [name, description, color, id],
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found.' });
      return res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating category:', error);
      return res.status(500).json({ error: 'Failed to update category.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await db.query('DELETE FROM categories WHERE id = $1', [id]);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting category:', error);
      return res.status(500).json({ error: 'Failed to delete category.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
