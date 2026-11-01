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


let booksReady = null;

function ensureBookTables(database) {
  if (!booksReady) {
    booksReady = database
      .query(
        `CREATE TABLE IF NOT EXISTS books (
           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
           title text NOT NULL,
           author text NOT NULL DEFAULT '',
           created_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE TABLE IF NOT EXISTS book_words (
           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
           book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
           page integer NOT NULL DEFAULT 1,
           word text NOT NULL,
           meaning text NOT NULL DEFAULT '',
           meaning_gujarati text NOT NULL DEFAULT '',
           created_at timestamptz NOT NULL DEFAULT now()
         );
         CREATE INDEX IF NOT EXISTS book_words_book_id_idx ON book_words (book_id, page);`,
      )
      .catch((error) => {
        booksReady = null;
        throw error;
      });
  }
  return booksReady;
}

function bookRoute(handler, label) {
  return async (req, res) => {
    const database = getPool(res);
    if (!database) return;
    try {
      await ensureBookTables(database);
      await handler(database, req, res);
    } catch (error) {
      console.error(`Error in ${label}:`, error);
      res.status(500).json({ error: `${label} request failed.` });
    }
  };
}

app.get('/api/books', bookRoute(async (db, _req, res) => {
  res.json((await db.query('SELECT * FROM books ORDER BY created_at DESC')).rows);
}, 'books'));

app.post('/api/books', bookRoute(async (db, req, res) => {
  const { title, author } = req.body;
  const result = await db.query('INSERT INTO books (title, author) VALUES ($1, $2) RETURNING *', [title, author || '']);
  res.status(201).json(result.rows[0]);
}, 'books'));

app.put('/api/books/:id', bookRoute(async (db, req, res) => {
  const { title, author } = req.body;
  const result = await db.query('UPDATE books SET title = $1, author = $2 WHERE id = $3 RETURNING *', [title, author || '', req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found.' });
  res.json(result.rows[0]);
}, 'books'));

app.delete('/api/books/:id', bookRoute(async (db, req, res) => {
  await db.query('DELETE FROM books WHERE id = $1', [req.params.id]);
  res.status(204).send();
}, 'books'));

app.get('/api/book-words', bookRoute(async (db, _req, res) => {
  res.json((await db.query('SELECT * FROM book_words ORDER BY page, created_at')).rows);
}, 'book words'));

app.post('/api/book-words', bookRoute(async (db, req, res) => {
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
  res.status(201).json(result.rows);
}, 'book words'));

app.put('/api/book-words/:id', bookRoute(async (db, req, res) => {
  const { page, word, meaning, meaning_gujarati } = req.body;
  const result = await db.query(
    'UPDATE book_words SET page = $1, word = $2, meaning = $3, meaning_gujarati = $4 WHERE id = $5 RETURNING *',
    [page, word, meaning || '', meaning_gujarati || '', req.params.id],
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Word not found.' });
  res.json(result.rows[0]);
}, 'book words'));

app.delete('/api/book-words/:id', bookRoute(async (db, req, res) => {
  await db.query('DELETE FROM book_words WHERE id = $1', [req.params.id]);
  res.status(204).send();
}, 'book words'));

app.listen(port, () => {
  console.log(`Database API listening on http://localhost:${port}`);
});
