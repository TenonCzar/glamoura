import { db } from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { page = 1, limit = 25 } = req.query
  const offset = (page - 1) * limit

  try {
    const orders = await db.execute(
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset],
    )

    const count = await db.execute(`SELECT COUNT(*) as total FROM orders`)

    res.status(200).json({
      success: true,
      recentOrders: orders.rows,
      total: count.rows[0].total,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
