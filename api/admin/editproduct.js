import { db } from '../db.js'
import { formidable } from 'formidable'
import fs from 'fs'
import path from 'path'
import process from 'process'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).end()

  const form = formidable({ multiples: true, keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, error: err.message })

    const productId = req.query.id

    try {
      // Get form fields
      const {
        name,
        description,
        slug,
        sku,
        price,
        is_active,
        is_featured,
        is_bestseller,
        is_new,
        categories,
      } = fields

      // Update product
      await db.execute(
        `UPDATE products SET
          name = ?, description = ?, slug = ?, sku = ?, price = ?,
          is_active = ?, is_featured = ?, is_bestseller = ?, is_new = ?
        WHERE product_id = ?`,
        [
          name,
          description,
          slug,
          sku,
          price,
          is_active === 'true',
          is_featured === 'true',
          is_bestseller === 'true',
          is_new === 'true',
          productId,
        ],
      )

      // Update categories
      await db.execute(`DELETE FROM product_categories WHERE product_id = ?`, [productId])
      const categoryArray = JSON.parse(categories || '[]')
      for (const catId of categoryArray) {
        await db.execute(`INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`, [
          productId,
          catId,
        ])
      }

      //Update Variants

      await db.execute(`DELETE FROM product_variants WHERE product_id = ?`, [productId])
      const variants = JSON.parse(fields.variants || '[]')
      for (const v of variants) {
        await db.execute(
          `INSERT INTO product_variants (
      product_id, sku, price, compare_at_price, cost_price,
      weight, weight_unit, is_default
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            productId,
            v.sku,
            v.price,
            v.compare_at_price,
            v.cost_price,
            v.weight,
            v.weight_unit,
            v.is_default ? 1 : 0,
          ],
        )
      }

    //   Update Inventory

      const inventory = JSON.parse(fields.inventory || '[]')
      for (const inv of inventory) {
        // Either update existing or insert new
        await db.execute(
          `INSERT OR REPLACE INTO inventory (
      inventory_id, product_id, variant_id, quantity, low_stock_threshold, location, last_stock_update
    ) VALUES (
      COALESCE((SELECT inventory_id FROM inventory WHERE product_id = ? AND variant_id IS ?), NULL),
      ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    )`,
          [
            productId,
            inv.variant_id || null,
            productId,
            inv.variant_id || null,
            inv.quantity,
            inv.low_stock_threshold || 5,
            inv.location || '',
          ],
        )
      }

      // Handle new uploaded images
      if (files.images) {
        const imageFiles = Array.isArray(files.images) ? files.images : [files.images]
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i]
          const data = fs.readFileSync(file.filepath)
          const fileName = `${Date.now()}-${file.originalFilename}`
          const uploadPath = path.join(process.cwd(), 'public/uploads', fileName)
          fs.writeFileSync(uploadPath, data)

          await db.execute(
            `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
             VALUES (?, ?, ?, ?, ?)`,
            [
              productId,
              `/uploads/${fileName}`,
              file.originalFilename,
              99, // push to end
              0, // not primary
            ],
          )
        }
      }

      res.status(200).json({ success: true, productId })
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
}
