import { db } from '../api/db.js'

export default async function handler(req, res) {
  try {
    const result = await db.execute(`
      SELECT
        p.product_id,
        p.name,
        p.slug,
        p.price,
        p.compare_at_price,
        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.product_id
          ORDER BY display_order
          LIMIT 1
        ) AS image_url,
        (
          SELECT GROUP_CONCAT(c.name, ', ')
          FROM product_categories pc
          JOIN categories c ON c.category_id = pc.category_id
          WHERE pc.product_id = p.product_id
        ) AS category
      FROM products p
      WHERE p.is_featured = 1 AND p.is_active = 1
      ORDER BY p.product_id DESC
    `)

    const products = result.rows.map((row) => {
      const normalized = {}
      for (const key in row) {
        const val = row[key]
        normalized[key] = typeof val === 'bigint' ? Number(val) : val
      }
      return normalized
    })

    res.status(200).json({ success: true, products })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
