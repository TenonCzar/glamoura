import { db } from '../db.js'

export default async function handler(req, res) {
  const productId = req.query.id

  if (req.method === 'GET') {
    try {
      // Fetch main product
      const [productRow] = await db.execute(
        `SELECT * FROM products WHERE product_id = ?`,
        [productId],
      )

      if (!productRow) return res.status(404).json({ success: false, error: 'Product not found' })

      // Fetch categories
      const categories = await db.execute(
        `SELECT category_id FROM product_categories WHERE product_id = ?`,
        [productId],
      )

      // Fetch images
      const images = await db.execute(
        `SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order`,
        [productId],
      )

      // Fetch variants
      const variants = await db.execute(
        `SELECT * FROM product_variants WHERE product_id = ?`,
        [productId],
      )

      // Fetch inventory
      const inventory = await db.execute(
        `SELECT * FROM inventory WHERE product_id = ?`,
        [productId],
      )

      res.status(200).json({
        success: true,
        product: {
          ...productRow,
          categories: categories.map((c) => c.category_id),
          images,
          variants,
          inventory,
        },
      })
    } catch (err) {
      res.status(500).json({ success: false, error: err.message })
    }
  }
}