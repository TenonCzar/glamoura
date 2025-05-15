// /api/admin/delete-user.js
import { db } from '../db.js' // adjust path if needed

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { user_id } = req.query

  try {
    await db.execute(`DELETE FROM users WHERE user_id = ?`, [user_id])
    res.status(200).json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
