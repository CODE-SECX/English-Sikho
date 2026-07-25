import { getPool, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = getPool(res);
  if (!db) return;

  if (req.method === 'GET') {
    try {
      const result = await db.query(
        `SELECT
           s.id,
           s.title,
           s.description,
           s.moment_of_memory,
           s.category_id,
           s.language,
           s.date,
           s.created_at,
           c.id          AS category__id,
           c.name        AS category__name,
           c.description AS category__description,
           c.color       AS category__color,
           c.created_at  AS category__created_at
         FROM sikho s
         LEFT JOIN categories c ON c.id = s.category_id
         ORDER BY s.created_at DESC`,
      );

      const rows = result.rows.map((row) => {
        const category = row.category__id
          ? {
              id: row.category__id,
              name: row.category__name,
              description: row.category__description,
              color: row.category__color,
              created_at: row.category__created_at,
            }
          : null;

        return {
          id: row.id,
          title: row.title,
          description: row.description,
          moment_of_memory: row.moment_of_memory,
          category_id: row.category_id,
          language: row.language,
          date: row.date,
          created_at: row.created_at,
          category,
        };
      });

      return res.json(rows);
    } catch (error) {
      console.error('Error fetching sikho:', error);
      return res.status(500).json({ error: 'Failed to fetch sikho entries.' });
    }
  }

  if (req.method === 'POST') {
    const { title, description, moment_of_memory, category_id, language, date } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO sikho (title, description, moment_of_memory, category_id, language, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, description, moment_of_memory, category_id, language, date],
      );
      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating sikho entry:', error);
      return res.status(500).json({ error: 'Failed to create sikho entry.' });
    }
  }

  res.status(405).json({ error: 'Method not allowed.' });
}
