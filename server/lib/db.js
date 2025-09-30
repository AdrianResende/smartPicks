import mysql from 'mysql2/promise';

export function createDbPool() {
  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_CONNECTION_LIMIT } = process.env;

  if (!DB_HOST || !DB_USER || !DB_NAME) {
    throw new Error('Variáveis de ambiente DB_HOST, DB_USER e DB_NAME são obrigatórias.');
  }

  return mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD || undefined,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT ? Number(DB_CONNECTION_LIMIT) : 10,
    queueLimit: 0,
  });
}

export async function getConnectionStatus(pool) {
  const [rows] = await pool.query('SELECT 1 + 1 AS result');
  return rows?.[0]?.result === 2 ? 'connected' : 'unknown';
}
