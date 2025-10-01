import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { createDbPool, getConnectionStatus } from './lib/db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = createDbPool();
const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET || 'smartpicks-jwt-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Middleware de autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
};

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
  const { name, email, password, cpf, birthDate, perfil } = req.body;

  if (!email || !password || !cpf || !birthDate) {
    return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
  }

  // Validar perfil
  const perfilValido = perfil && ['usuario', 'admin'].includes(perfil) ? perfil : 'usuario';

  try {
    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const normalizedBirthDate = new Date(birthDate);

    if (Number.isNaN(normalizedBirthDate.getTime())) {
      return res.status(400).json({ message: 'Data de nascimento inválida.' });
    }

    await pool.execute(
      `INSERT INTO users (name, email, password_hash, cpf, birth_date, perfil)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name ?? null,
        email,
        passwordHash,
        cpf,
        normalizedBirthDate.toISOString().split('T')[0],
        perfilValido,
      ],
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
      'SELECT id, name, email, password_hash, perfil FROM users WHERE email = ? LIMIT 1',
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

    // Gerar JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    return res.json({
      message: 'Login realizado com sucesso.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        perfil: user.perfil || 'usuario',
      },
      token,
    });
  } catch (error) {
    console.error('Erro ao realizar login', error);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
});

// Endpoint para validar token
app.get('/auth/validate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      'SELECT id, name, email, perfil FROM users WHERE id = ? LIMIT 1',
      [userId],
    );

    const user = rows?.[0];
    if (!user) {
      return res.status(401).json({ valid: false, message: 'Usuário não encontrado.' });
    }

    return res.json({
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        perfil: user.perfil || 'usuario',
      },
    });
  } catch (error) {
    console.error('Erro ao validar token', error);
    return res.status(500).json({ valid: false, message: 'Erro ao validar token.' });
  }
});

// Endpoint para logout (opcional - principalmente para limpeza no lado do cliente)
app.post('/auth/logout', authenticateToken, (req, res) => {
  // Em uma aplicação real, você poderia adicionar o token a uma blacklist
  res.json({ message: 'Logout realizado com sucesso.' });
});

app.listen(port, () => {
  console.log(`SmartPicks backend rodando na porta ${port}`);
});
