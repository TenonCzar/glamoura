import { db } from './db.js';
import { hashPassword, generateToken } from './utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed');

  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    avatar_url,
    is_admin = false,
    admin_role = null,
    permissions = null,
    department = null,
  } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const hashed = hashPassword(password);

    const insertUser = await db.execute({
      sql: `
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, phone, avatar_url, is_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        username,
        email,
        hashed,
        first_name ?? null,
        last_name ?? null,
        phone ?? null,
        avatar_url ?? null,
        is_admin === true || is_admin === 'true' ? 1 : 0,
      ],
    })

    const user_id = Number(insertUser.lastInsertRowid)

    if (is_admin && admin_role) {
      await db.execute({
        sql: `
      INSERT INTO admin_profiles (user_id, role, permissions, department)
      VALUES (?, ?, ?, ?)
    `,
        args: [user_id, admin_role, JSON.stringify(permissions ?? {}), department ?? null],
      })
    }

    const token = generateToken({ user_id, username, is_admin })

    res.status(200).json({ success: true, token })
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }
    res.status(500).json({ error: err.message });
  }
}
