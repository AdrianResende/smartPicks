import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';

import { createDbPool, getConnectionStatus } from './lib/db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = createDbPool();
const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 10);

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

app.post('/auth/register', async (req, res) => {
  const { name, email, password, cpf, birthDate } = req.body;

  if (!email || !password || !cpf || !birthDate) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const normalizedBirthDate = new Date(birthDate);

    if (Number.isNaN(normalizedBirthDate.getTime())) {
      return res.status(400).json({ message: 'Data de nascimento inválida.' });
    }

    await pool.execute(
      `INSERT INTO users (name, email, password_hash, cpf, birth_date)
       VALUES (?, ?, ?, ?, ?)`,
      [name ?? null, email, passwordHash, cpf, normalizedBirthDate.toISOString().split('T')[0]],
    );

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'E-mail ou CPF já cadastrado.' });
    }

    console.error('Erro ao cadastrar usuário', error);
    return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Informe e-mail e senha.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email],
    );

    const user = rows?.[0];

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    return res.json({
      message: 'Login realizado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Erro ao realizar login', error);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
});

app.listen(port, () => {
  console.log(`SmartPicks backend rodando na porta ${port}`);
});
