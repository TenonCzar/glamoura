import {formidable} from 'formidable'
import fs from 'fs'
import path from 'path'
import { db } from '../db.js'
import process from 'process'

export const config = {
  api: {
    bodyParser: false,
  },
}

function normalizeBigInts(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeBigInts)
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        typeof value === 'bigint' ? Number(value) : value,
      ]),
    )
  }
  return obj
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({ multiples: true, keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, error: err.message })

    try {
      const {
        name,
        description,
        short_description,
        sku,
        price,
        compare_at_price,
        cost_price,
        is_taxable,
        weight,
        weight_unit,
        is_active,
        is_featured,
        is_bestseller,
        is_new,
        slug,
        meta_title,
        meta_description,
      } = fields

      const productRes = await db.execute(
        `INSERT INTO products (
          name, description, short_description, sku, price, compare_at_price, cost_price,
          is_taxable, weight, weight_unit, is_active, is_featured, is_bestseller, is_new,
          slug, meta_title, meta_description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description,
          short_description,
          sku,
          price,
          compare_at_price,
          cost_price,
          is_taxable === 'true',
          weight,
          weight_unit,
          is_active === 'true',
          is_featured === 'true',
          is_bestseller === 'true',
          is_new === 'true',
          slug,
          meta_title,
          meta_description,
        ],
      )

      const productId = productRes.lastInsertRowid

      // Handle categories
      const categories = JSON.parse(fields.categories || '[]')
      for (const catId of categories) {
        await db.execute(`INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`, [
          productId,
          catId,
        ])
      }

      // Handle images
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
          [productId, `/uploads/${fileName}`, file.originalFilename, i, i === 0],
        )
      }

      // Handle variants
      const variants = JSON.parse(fields.variants || '[]')
      for (const v of variants) {
        const variantRes = await db.execute(
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
        const variantId = variantRes.lastInsertRowid

        // Insert inventory row
        await db.execute(
          `INSERT INTO inventory (
            product_id, variant_id, quantity, low_stock_threshold, location
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            productId,
            variantId,
            v.inventory_quantity || 0,
            v.low_stock_threshold || 5,
            v.location || '',
          ],
        )
      }

      res.status(200).json(normalizeBigInts({ success: true, productId }))
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, error: error.message })
    }
  })
}
