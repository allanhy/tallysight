import express from 'express';
import {Pool} from 'pg';
import dotenv from 'dotenv';
import next from 'next';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const pool = new Pool ({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

app.prepare().then(() => {
  const server = express();

  // Route to get data from the "Users" table
  server.get('/users', async (req, res) => {
    const { username } = req.query;  // e.g., /users?name=John
    try {
      const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Define your custom backend routes
  server.get('/admins', async (req, res) => {
    const { admin_id } = req.query;  // e.g., /users?name=John
    try {
      const result = await pool.query('SELECT * FROM Admins WHERE admin_id = $1', [admin_id]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Handle other routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});