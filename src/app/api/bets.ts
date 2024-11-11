import {NextApiRequest, NextApiResponse} from 'next';
import {Pool} from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await pool.query('SELECT bet_id, user_id, event_id, amount, payoff, status, date_placed FROM Bets');
    res.status(200).json(result.rows); // Send users data as JSON response
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database error' });
  }
}