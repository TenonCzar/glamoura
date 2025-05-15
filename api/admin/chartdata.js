// /api/admin/dashboard-chart.js
import { db } from '../db.js'
import process from 'process'

export default async function handler(req, res) {
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
