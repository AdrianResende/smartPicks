import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { createDbPool, getConnectionStatus } from './lib/db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = createDbPool();

app.get('/health', async (_req, res) => {
  try {
    const status = await getConnectionStatus(pool);
    res.json({ status: 'ok', database: status });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.get('/users', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users LIMIT 50');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Falha ao consultar usuários', detail: error.message });
  }
});

app.listen(port, () => {
  console.log(`SmartPicks backend rodando na porta ${port}`);
});
