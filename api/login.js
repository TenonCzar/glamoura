import { db } from './db.js';
import { comparePassword, generateToken } from './utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed');

  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ? AND is_active = 1`,
      args: [email],
    });

    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found or inactive' });

    const valid = comparePassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    await db.execute({
      sql: `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`,
      args: [user.user_id],
    });

    const token = generateToken(user);
    res.status(200).json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
