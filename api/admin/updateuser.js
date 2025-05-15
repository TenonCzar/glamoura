// /api/admin/update-user.js
import { db } from '../db.js' // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end()

  const { user_id } = req.query
  const { username, email, first_name, last_name } = req.body

  const id = Number(user_id)

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid or missing user ID' })
  }

  try {
    await db.execute(
      `UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ? WHERE user_id = ?`,
      [username, email, first_name, last_name, id],
    )

    res.status(200).json({ success: true, message: 'User updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
