import { db } from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { order_id, status } = req.body

  if (!order_id || !status) {
    return res.status(400).json({ success: false, error: 'Order ID and status are required' })
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value' })
  }

  try {
    await db.execute(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?`,
      [status, order_id],
    )

    // If status is 'delivered', create a shipment record if it doesn't exist
    if (status === 'delivered') {
      const [existingShipment] = await db.execute('SELECT * FROM shipments WHERE order_id = ?', [
        order_id,
      ])

      if (!existingShipment.rows.length) {
        await db.execute(
          `INSERT INTO shipments 
           (order_id, status, shipping_date, actual_delivery_date, created_at, updated_at)
           VALUES (?, 'delivered', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [order_id],
        )
      }
    }

    res.status(200).json({ success: true, message: 'Order status updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}