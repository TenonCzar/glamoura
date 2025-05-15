// /api/admin/dashboard-summary.js
import { db } from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const [users, orders, products, shipments] = await Promise.all([
      db.execute('SELECT COUNT(*) AS total FROM users'),
      db.execute('SELECT COUNT(*) AS total FROM orders'),
      db.execute('SELECT COUNT(*) AS total FROM products'),
      db.execute('SELECT COUNT(*) AS total FROM shipments'),
    ])

    const recentOrders = await db.execute(
      'SELECT user_id, customer_name AS customer, order_number, created_at AS date, total_amount AS amount, status FROM orders ORDER BY created_at DESC LIMIT 5',
    )

    const recentReviews = await db.execute(
      'SELECT user_id, rating, comment FROM reviews ORDER BY created_at DESC LIMIT 5',
    )

    const sales = await db.execute(`
  SELECT 
    DATE(created_at) AS date, 
    SUM(total_amount) AS total 
  FROM orders 
  GROUP BY date 
  ORDER BY date DESC 
  LIMIT 7
`)

    res.json({
      success: true,
      totalUsers: users.rows[0].total,
      totalOrders: orders.rows[0].total,
      totalProducts: products.rows[0].total,
      totalShipments: shipments.rows[0].total,
      recentOrders: recentOrders.rows,
      recentReviews: recentReviews.rows,
      salesOverTime: sales.rows.reverse(),
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
