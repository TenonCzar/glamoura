import { db } from '../db.js'

export default async function handler(req, res) {
  try {
    const result = await db.execute(`
      SELECT
        p.product_id,
        p.name,
        p.slug,
        p.price,
        p.is_active,
        p.compare_at_price,
        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.product_id
          ORDER BY display_order
          LIMIT 1
        ) AS image_url,
        EXISTS (
          SELECT 1
          FROM product_variants
          WHERE product_id = p.product_id
        ) AS has_variants,
        (
          SELECT GROUP_CONCAT(c.name, ', ')
          FROM product_categories pc
          JOIN categories c ON c.category_id = pc.category_id
          WHERE pc.product_id = p.product_id
        ) AS categories
      FROM products p
      ORDER BY p.product_id DESC
    `)

    // Normalize BigInts (Turso sometimes returns BigInts)
    const products = result.rows.map((row) => {
      const normalized = {}
      for (const key in row) {
        const val = row[key]
        normalized[key] = typeof val === 'bigint' ? Number(val) : val
      }
      normalized.has_variants = !!normalized.has_variants
      return normalized
    })

    res.status(200).json({ success: true, products })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}
