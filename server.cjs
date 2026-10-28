const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const net = require('net');

// Node's default 250ms per-address connect attempt is too short on slower networks (causes ETIMEDOUT to Neon).
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL || process.env.VITE_DATABASE_URL;

app.use(express.json());

const pool = connectionString
  ? new Pool({ connectionString, connectionTimeoutMillis: 20000 })
  : null;

function getPool(res) {
  if (!pool) {
    res.status(500).json({ error: 'Database connection string is not configured.' });
    return null;
  }

  return pool;
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, configured: Boolean(connectionString) });
});

app.get('/api/categories', async (_req, res) => {
  const database = getPool(res);
  if (!database) return;

  try {
    const result = await database.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

app.post('/api/categories', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { name, description, color } = req.body;
  try {
    const result = await database.query(
      'INSERT INTO categories (name, description, color) VALUES ($1, $2, $3) RETURNING *',
      [name, description, color],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { id } = req.params;
  const { name, description, color } = req.body;
  try {
    const result = await database.query(
      'UPDATE categories SET name = $1, description = $2, color = $3 WHERE id = $4 RETURNING *',
      [name, description, color, id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { id } = req.params;
  try {
    await database.query('DELETE FROM categories WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

app.get('/api/vocabulary', async (_req, res) => {
  const database = getPool(res);
  if (!database) return;

  try {
    const result = await database.query('SELECT * FROM vocabulary ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({ error: 'Failed to fetch vocabulary.' });
  }
});

app.post('/api/vocabulary', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { word, meaning, context, moment_of_memory, language, date } = req.body;
  try {
    const result = await database.query(
      'INSERT INTO vocabulary (word, meaning, context, moment_of_memory, language, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [word, meaning, context, moment_of_memory, language, date],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    res.status(500).json({ error: 'Failed to create vocabulary.' });
  }
});

app.put('/api/vocabulary/:id', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { id } = req.params;
  const { word, meaning, context, moment_of_memory, language, date } = req.body;
  try {
    const result = await database.query(
      'UPDATE vocabulary SET word = $1, meaning = $2, context = $3, moment_of_memory = $4, language = $5, date = $6 WHERE id = $7 RETURNING *',
      [word, meaning, context, moment_of_memory, language, date, id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    res.status(500).json({ error: 'Failed to update vocabulary.' });
  }
});

app.delete('/api/vocabulary/:id', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { id } = req.params;
  try {
    await database.query('DELETE FROM vocabulary WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    res.status(500).json({ error: 'Failed to delete vocabulary.' });
  }
});

app.get('/api/sikho', async (_req, res) => {
  const database = getPool(res);
  if (!database) return;

  try {
    const result = await database.query(
      `SELECT
         s.id,
         s.title,
         s.description,
         s.moment_of_memory,
         s.category_id,
         s.language,
         s.date,
         s.created_at,
         c.id AS category__id,
         c.name AS category__name,
         c.description AS category__description,
         c.color AS category__color,
         c.created_at AS category__created_at
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

    res.json(rows);
  } catch (error) {
    console.error('Error fetching sikho:', error);
    res.status(500).json({ error: 'Failed to fetch sikho entries.' });
  }
});

app.post('/api/sikho', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { title, description, moment_of_memory, category_id, language, date } = req.body;
  try {
    const result = await database.query(
      'INSERT INTO sikho (title, description, moment_of_memory, category_id, language, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, moment_of_memory, category_id, language, date],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sikho entry:', error);
    res.status(500).json({ error: 'Failed to create sikho entry.' });
  }
});

app.put('/api/sikho/:id', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { id } = req.params;
  const { title, description, moment_of_memory, category_id, language, date } = req.body;
  try {
    const result = await database.query(
      'UPDATE sikho SET title = $1, description = $2, moment_of_memory = $3, category_id = $4, language = $5, date = $6 WHERE id = $7 RETURNING *',
      [title, description, moment_of_memory, category_id, language, date, id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating sikho entry:', error);
    res.status(500).json({ error: 'Failed to update sikho entry.' });
  }
});

app.delete('/api/sikho/:id', async (req, res) => {
  const database = getPool(res);
  if (!database) return;

  const { id } = req.params;
  try {
    await database.query('DELETE FROM sikho WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting sikho entry:', error);
    res.status(500).json({ error: 'Failed to delete sikho entry.' });
  }
});

app.listen(port, () => {
  console.log(`Database API listening on http://localhost:${port}`);
});
