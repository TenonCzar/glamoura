import { db } from '../db.js'

export default async function handler(req, res) {
  try {
    const result = await db.execute(`SELECT category_id, name FROM categories WHERE is_active = 1`)
    const rows = result?.rows || result[0]?.rows || []
    res.status(200).json(rows)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}