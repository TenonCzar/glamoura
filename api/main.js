import { db } from './db.js'
import jwt from 'jsonwebtoken'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import process from 'process'
import { hashPassword, comparePassword, generateToken } from './utils.js'
const uploadDir = path.join(process.cwd(), 'public', 'uploads')

// Configure formidable for Vercel
const form = formidable({
  multiples: true,
  uploadDir: '/tmp', // Vercel requires tmp directory
  keepExtensions: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB limit
})

export default async function handler(req, res) {
  console.log(`Incoming ${req.method} request to: ${req.url}`)
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Define routePath early so you can use it anywhere
  const basePath = '/api'
  const routePath = req.url.startsWith(basePath)
    ? req.url.slice(basePath.length).split('?')[0]
    : req.url.split('?')[0]

  // Handle the special case for product preview
  if (routePath.startsWith('/api/products/')) {
    const slug = routePath.replace('/api/products/', '')
    return await previewProduct(req, res, slug)
  }

  try {
    // Now the switch uses the defined routePath
    switch (routePath) {
      case '/api/admin/chartdata':
        return await handleChartData(req, res)
      case '/api/admin/dashboard-summary':
        return await handleDashboardSummary(req, res)
      case '/api/admin/createcategory':
        return await createCategory(req, res)
      case '/api/admin/getcategory':
        return await getCategory(req, res)
      case '/api/admin/parentcategories':
        return await parentCategory(req, res)
      case '/api/admin/createproduct':
        return await createProduct(req, res)
      case '/api/admin/editproduct':
        return await editProducts(req, res)
      case '/api/admin/getproducts':
        return await getProducts(req, res)
      case '/api/admin/getusers':
        return await getUsers(req, res)
      case '/api/admin/updateuser':
        return await updateUser(req, res)
      case '/api/admin/deleteuser':
        return await deleteUser(req, res)
      case '/api/admin/orders':
        return await getOrders(req, res)
      case '/api/admin/orderstats':
        return await orderStats(req, res)
      case '/api/add-to-cart':
        return await addToCart(req, res)
      case '/api/adminpin':
        return await adminPin(req, res)
      case '/api/createadmin':
        return await createAdmin(req, res)
      case '/api/featured-products':
        return await featuredProducts(req, res)
      case '/api/bestsellers':
        return await bestSellers(req, res)
      case '/api/login':
        return await login(req, res)
      case '/api/signup':
        return await signUp(req, res)
      default:
        return res.status(404).json({ success: false, error: 'Endpoint not found' })
    }
  } catch (err) {
    console.error('API Error:', err)
    return res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
  }
}
export const config = {
  api: {
    bodyParser: false,
  },
}

// Utility function for file handling in Vercel
const handleFileUpload = async (file) => {
  const uploadDir = path.join('/tmp', 'uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const newFilename = `${Date.now()}-${file.originalFilename}`
  const newPath = path.join(uploadDir, newFilename)

  // For Vercel, we need to read the file and write it to the new location
  const fileData = fs.readFileSync(file.filepath)
  fs.writeFileSync(newPath, fileData)
  fs.unlinkSync(file.filepath) // Clean up temporary file

  return `/uploads/${newFilename}`
}

// Slugify function
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Normalize BigInt values for JSON responses
function normalizeBigInts(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeBigInts)
  } else if (typeof obj === 'object' && obj !== null) {
    const normalized = {}
    for (const key in obj) {
      const value = obj[key]
      normalized[key] =
        typeof value === 'bigint' ? Number(value) : normalizeBigInts(value)
    }
    return normalized
  }
  return obj
}
// ADMIN JS ROUTES

// /api/admin/dashboard-summary.js
async function handleDashboardSummary(req, res) {
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

// CharData
async function handleChartData(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { range = '30' } = req.query
    const days = parseInt(range)

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // SQLite compatible date formatting
    const formatDateForSQLite = (date) => {
      return date
        .toISOString()
        .replace('T', ' ')
        .replace(/\.\d+Z$/, '')
    }

    const startDateStr = formatDateForSQLite(startDate)
    const endDateStr = formatDateForSQLite(endDate)

    // Get all counts first to verify data
    const [totalCounts] = await Promise.all([
      db.execute(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM products) as total_products,
          (SELECT COUNT(*) FROM shipments) as total_shipments
      `),
    ])

    console.log('Database totals:', totalCounts.rows[0])

    // SQLite-compatible queries
    const [usersResult, ordersResult, productsResult, shipmentsResult, salesResult] =
      await Promise.all([
        // Users - SQLite uses strftime for date formatting
        db.execute(
          `
        SELECT 
          strftime('%Y-%m-%d', created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date ASC
      `,
          [startDateStr, endDateStr],
        ),

        // Orders
        db.execute(
          `
        SELECT 
          strftime('%Y-%m-%d', created_at) as date,
          status,
          COUNT(*) as count
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m-%d', created_at), status
        ORDER BY date ASC
      `,
          [startDateStr, endDateStr],
        ),

        // Products
        db.execute(
          `
        SELECT 
          strftime('%Y-%m-%d', created_at) as date,
          COUNT(*) as count
        FROM products
        WHERE created_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date ASC
      `,
          [startDateStr, endDateStr],
        ),

        // Shipments
        db.execute(
          `
        SELECT 
          strftime('%Y-%m-%d', created_at) as date,
          COUNT(*) as count
        FROM shipments
        WHERE created_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date ASC
      `,
          [startDateStr, endDateStr],
        ),

        // Sales
        db.execute(
          `
        SELECT 
          strftime('%Y-%m-%d', created_at) as date,
          SUM(total_amount) as total
        FROM orders
        WHERE created_at BETWEEN ? AND ?
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date ASC
      `,
          [startDateStr, endDateStr],
        ),
      ])

    // Debug logs
    console.log('Users data:', usersResult.rows)
    console.log('Orders data:', ordersResult.rows)
    console.log('Products data:', productsResult.rows)
    console.log('Shipments data:', shipmentsResult.rows)
    console.log('Sales data:', salesResult.rows)

    // Generate all dates in the range
    const dates = []
    const dateMap = {}

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dates.push(dateStr)
      dateMap[dateStr] = {
        users: 0,
        orders: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          refunded: 0,
        },
        products: 0,
        shipments: 0,
        sales: 0,
      }
    }

    // Process users data
    usersResult.rows.forEach((row) => {
      if (dateMap[row.date]) {
        dateMap[row.date].users = row.count
      }
    })

    // Process orders data
    ordersResult.rows.forEach((row) => {
      if (dateMap[row.date] && dateMap[row.date].orders[row.status]) {
        dateMap[row.date].orders[row.status] = row.count
      }
    })

    // Process products data
    productsResult.rows.forEach((row) => {
      if (dateMap[row.date]) {
        dateMap[row.date].products = row.count
      }
    })

    // Process shipments data
    shipmentsResult.rows.forEach((row) => {
      if (dateMap[row.date]) {
        dateMap[row.date].shipments = row.count
      }
    })

    // Process sales data
    salesResult.rows.forEach((row) => {
      if (dateMap[row.date]) {
        dateMap[row.date].sales = row.total || 0
      }
    })

    // Prepare response
    const responseData = {
      dates,
      users: dates.map((date) => dateMap[date].users),
      orders: {
        pending: dates.map((date) => dateMap[date].orders.pending),
        processing: dates.map((date) => dateMap[date].orders.processing),
        shipped: dates.map((date) => dateMap[date].orders.shipped),
        delivered: dates.map((date) => dateMap[date].orders.delivered),
        cancelled: dates.map((date) => dateMap[date].orders.cancelled),
        refunded: dates.map((date) => dateMap[date].orders.refunded),
      },
      products: dates.map((date) => dateMap[date].products),
      shipments: dates.map((date) => dateMap[date].shipments),
      sales: dates.map((date) => dateMap[date].sales),
    }

    res.json({
      success: true,
      data: responseData,
    })
  } catch (err) {
    console.error('Error in dashboard-chart:', err)
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  }
}

// Get Users
async function getUsers(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { page = 1, limit = 10, search = '' } = req.query
  const offset = (page - 1) * limit
  const q = `%${search}%`

  try {
    const users = await db.execute(
      `SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [q, q, limit, offset],
    )
    const count = await db.execute(
      `SELECT COUNT(*) as total FROM users WHERE username LIKE ? OR email LIKE ?`,
      [q, q],
    )

    res.status(200).json({ success: true, users: users.rows, total: count.rows[0].total })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Update User
async function updateUser(req, res) {
  if (req.method !== 'PUT') return res.status(405).end()

  const { user_id } = req.query
  const { username, email, first_name, last_name } = req.body

  const id = Number(user_id)

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ success: false, error: 'Invalid or missing user ID' })
  }

  try {
    await db.execute(
      `UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ? WHERE user_id = ?`,
      [username, email, first_name, last_name, id],
    )

    res.status(200).json({ success: true, message: 'User updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Delete User
async function deleteUser(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const { user_id } = req.query

  try {
    await db.execute(`DELETE FROM users WHERE user_id = ?`, [user_id])
    res.status(200).json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Get Orders
async function getOrders(req, res) {
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

// Order Status
async function orderStats(req, res) {
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

// Create Category
async function createCategory(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({ multiples: false, uploadDir: './public/uploads', keepExtensions: true })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ success: false, error: 'Form parsing failed' })

    try {
      const f = Object.fromEntries(
        Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
      )
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
          f.display_order || 0,
        ],
      )

      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  })
}

// Get Category
async function getCategory(req, res) {
  try {
    const result = await db.execute(`SELECT category_id, name FROM categories WHERE is_active = 1`)
    const rows = result?.rows || result[0]?.rows || []
    res.status(200).json(rows)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Parent Categories
async function parentCategory(req, res) {
  try {
    const result = await db.execute(
      `SELECT category_id, name FROM categories WHERE is_parent = 1 AND is_active = 1`,
    )

    const rows = result?.rows || result[0]?.rows || []
    res.status(200).json(rows)
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
}

// Create Product

async function createProduct(req, res) {
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
          is_taxable == 1,
          weight,
          weight_unit,
          is_active == 1,
          is_featured == 1,
          is_bestseller == 1,
          is_new == 1,
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


// Edit Products
async function editProducts(req, res) {
  if (req.method !== 'PUT') return res.status(405).end()

  const form = formidable({
    multiples: true,
    uploadDir: '/tmp',
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message })
    }

    try {
      // Get form fields
      const productId = req.query.id
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
      COALESCE((SELECT inventory_id FROM inventory WHERE product_id = ? AND variant_id = ?), NULL),
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
      console.error('Product edit error:', error)
      return res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  })
}

// Get Products
async function getProducts(req, res) {
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

// Users JS Routes

// Add to cart
async function addToCart(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { product_id, variant_id = null, quantity = 1, price } = req.body

  const token = req.cookies?.token
  let user = null

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      user = null
    }
  }

  if (!user) {
    // For guests: We don’t store cart on backend now
    return res.status(200).json({
      success: true,
      message: 'Added To Cart. Please log in to save your cart.',
    })
  }

  try {
    // Find or create cart for logged-in user
    let cart = await db.execute(`SELECT * FROM carts WHERE user_id = ?`, [user.user_id])
    let cart_id

    if (cart.rows.length === 0) {
      const insert = await db.execute(`INSERT INTO carts (user_id) VALUES (?)`, [user.user_id])
      cart_id = insert.lastInsertRowid
    } else {
      cart_id = cart.rows[0].cart_id
    }

    // Check if the product + variant already exists in cart_items
    let existing = await db.execute(
      `SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND (variant_id IS ? OR variant_id = ?)`,
      [cart_id, product_id, variant_id, variant_id],
    )

    if (existing.rows.length > 0) {
      // Update quantity
      const newQuantity = existing.rows[0].quantity + quantity
      await db.execute(`UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?`, [
        newQuantity,
        existing.rows[0].cart_item_id,
      ])
    } else {
      // Insert new item
      await db.execute(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
        [cart_id, product_id, variant_id, quantity, price],
      )
    }

    res.status(200).json({ success: true, message: 'Added to your cart!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// Admin Pin
async function adminPin(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { pin } = req.body

  if (pin === process.env.ADMIN_ACCESS_PIN) {
    return res.status(200).json({ success: true })
  } else {
    return res.status(403).json({ error: 'Invalid pin' })
  }
}

// Create Admin
async function createAdmin(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed')

  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    avatar_url,
    is_admin = 1,
    admin_role = null,
    permissions = null,
    department = null,
  } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' })
  }

  const validRoles = [
    'super_admin',
    'inventory_manager',
    'order_manager',
    'customer_support',
    'marketing',
  ]
  const validDepartments = ['inventory', 'orders', 'support', 'marketing']

  try {
    const hashed = hashPassword(password)

    const insertUser = await db.execute({
      sql: `
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, phone, avatar_url, is_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        username,
        email,
        hashed,
        first_name ?? null,
        last_name ?? null,
        phone ?? null,
        avatar_url ?? null,
        is_admin,
      ],
    })

    const user_id = Number(insertUser.lastInsertRowid)

    if (is_admin) {
      if (!validRoles.includes(admin_role)) {
        return res.status(400).json({ error: 'Invalid admin role' })
      }
      if (department && !validDepartments.includes(department)) {
        return res.status(400).json({ error: 'Invalid department' })
      }

      await db.execute({
        sql: `
          INSERT INTO admin_profiles (user_id, role, permissions, department)
          VALUES (?, ?, ?, ?)
        `,
        args: [user_id, admin_role, JSON.stringify(permissions ?? {}), department ?? null],
      })
    }

    const token = generateToken({ user_id, username, is_admin })

    res.status(200).json({ success: true, token })
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email or username already exists' })
    }
    res.status(500).json({ error: err.message })
  }
}

// Featured Products
async function featuredProducts(req, res) {
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
// Featured Products
async function bestSellers(req, res) {
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
      WHERE p.is_bestseller = 1 AND p.is_active = 1
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

// Preview Product
async function previewProduct(req, res, slug) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const productResult = await db.execute(
      'SELECT * FROM products WHERE slug = ? LIMIT 1',
      [slug]
    )

    if (!productResult.rows.length) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    const product = productResult.rows[0]

    const productId = Number(product.product_id || product.id) // make sure it's a number

    // Get images and convert any BigInts to Numbers
    const imagesResult = await db.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [productId]
    )

    const images = (imagesResult.rows || []).map(image => {
      const fixed = {}
      for (const key in image) {
        const value = image[key]
        fixed[key] = typeof value === 'bigint' ? Number(value) : value
      }
      return fixed
    })

    // Also clean product itself in case there's a BigInt inside
    const cleanProduct = {}
    for (const key in product) {
      const value = product[key]
      cleanProduct[key] = typeof value === 'bigint' ? Number(value) : value
    }

    res.status(200).json({
      success: true,
      product: {
        ...cleanProduct,
        images,
      },
    })
  } catch (err) {
    console.error('ERROR in previewProduct:', err)
    res.status(500).json({ success: false, error: err.message })
  }
}


// Login
async function login(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed')

  const { email, password } = req.body

  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })

  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ? AND is_active = 1`,
      args: [email],
    })

    const user = result.rows[0]
    if (!user) return res.status(404).json({ error: 'User not found or inactive' })

    const valid = comparePassword(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Incorrect password' })

    await db.execute({
      sql: `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`,
      args: [user.user_id],
    })

    const token = generateToken(user)
    res.status(200).json({ success: true, token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Sign Up
async function signUp(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed')

  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone,
    avatar_url,
    is_admin = false,
    admin_role = null,
    permissions = null,
    department = null,
  } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Required fields missing' })
  }

  try {
    const hashed = hashPassword(password)

    const insertUser = await db.execute({
      sql: `
        INSERT INTO users (
          username, email, password_hash, first_name, last_name, phone, avatar_url, is_admin
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        username,
        email,
        hashed,
        first_name ?? null,
        last_name ?? null,
        phone ?? null,
        avatar_url ?? null,
        is_admin === true || is_admin === 'true' ? 1 : 0,
      ],
    })

    const user_id = Number(insertUser.lastInsertRowid)

    if (is_admin && admin_role) {
      await db.execute({
        sql: `
      INSERT INTO admin_profiles (user_id, role, permissions, department)
      VALUES (?, ?, ?, ?)
    `,
        args: [user_id, admin_role, JSON.stringify(permissions ?? {}), department ?? null],
      })
    }

    const token = generateToken({ user_id, username, is_admin })

    res.status(200).json({ success: true, token })
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email or username already exists' })
    }
    res.status(500).json({ error: err.message })
  }
}
