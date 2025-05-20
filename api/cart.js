import { db } from '../db.js'
import jwt from 'jsonwebtoken'
import process from 'process'

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { product_id, variant_id, quantity = 1, price } = req.body

  // --- Get IP address ---
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress

  // --- Decode JWT ---
  const token = req.cookies?.token
  let user = null

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      // Invalid token — treat as guest
      user = null
    }
  }

  try {
    if (user) {
      // === LOGGED IN: Ensure user cart exists ===
      let cart = await db.execute(`SELECT * FROM carts WHERE user_id = ?`, [user.user_id])

      let cart_id

      if (cart.rows.length === 0) {
        const insert = await db.execute(`INSERT INTO carts (user_id) VALUES (?)`, [user.user_id])
        cart_id = insert.lastInsertRowid
      } else {
        cart_id = cart.rows[0].cart_id
      }

      // === Insert into cart_items ===
      await db.execute(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [cart_id, product_id, variant_id, quantity, price],
      )

      res.status(200).json({ success: true, message: 'Added to your cart!' })
    } else {
      // === GUEST USER ===
      const guest_cart_id = ip

      // Create a fake carts entry for guests if you want — optional

      await db.execute(
        `INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, price)
         VALUES (?, ?, ?, ?, ?)`,
        [guest_cart_id, product_id, variant_id, quantity, price],
      )

      res.status(200).json({
        success: true,
        message: 'Added to cart as guest. Please log in to save your cart.',
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}
