// /api/admin/get-users.js
import { db } from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { page = 1, limit = 10, search = '' } = req.query
  const offset = (page - 1) * limit
  const q = `%${search}%`

  try {
    const users = await db.execute(
      `SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [q, q, limit, offset],
    )
    const count = await db.execute(
      `SELECT COUNT(*) as total FROM users WHERE username LIKE ? OR email LIKE ?`,
      [q, q],
    )

    res.status(200).json({ success: true, users: users.rows, total: count.rows[0].total })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
