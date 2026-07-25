import { getPool, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  if (req.method === 'GET') {
    try {
      const result = await db.query('SELECT * FROM categories ORDER BY name');
      return res.json(result.rows);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).json({ error: 'Failed to fetch categories.' });
    }
  }

  if (req.method === 'POST') {
    const { name, description, color } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO categories (name, description, color) VALUES ($1, $2, $3) RETURNING *',
        [name, description, color],
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating category:', error);
      return res.status(500).json({ error: 'Failed to create category.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
