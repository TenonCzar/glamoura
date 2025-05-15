import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { db } from '../db.js'

export const config = {
  api: {
    bodyParser: false,
  }
}

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({ multiples: false, uploadDir: './public/uploads', keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, error: 'Form parsing failed' })

    try {
      const f = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]))
      const slug = f.slug || slugify(f.name)
      const image_url = files.image ? '/uploads/' + files.image.newFilename : null

      await db.execute(
        `INSERT INTO categories (name, description, slug, image_url, is_parent, parent_id, is_active, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          f.name,
          f.description || '',
          slug,
          image_url,
          f.is_parent ? 1 : 0,
          f.is_parent ? null : f.parent_id,
          f.is_active ? 1 : 0,
          f.display_order || 0
        ]
      )

      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })
}
