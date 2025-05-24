import process from 'process'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { db } from './api/db.js' // adjust path to your Turso DB client

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Get users with pagination and search
app.get('/api/admin/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const offset = (page - 1) * limit
    const q = `%${search}%`

    const users = await db.execute(
      `SELECT * FROM users WHERE username LIKE ? OR email LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [q, q, limit, offset],
    )

    const count = await db.execute(
      `SELECT COUNT(*) as total FROM users WHERE username LIKE ? OR email LIKE ?`,
      [q, q],
    )

    res.json({ success: true, users: users.rows, total: count.rows[0].total })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Update user
app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { username, email, balance } = req.body
    const { id } = req.params

    await db.execute(`UPDATE users SET username = ?, email = ?, balance = ? WHERE id = ?`, [
      username,
      email,
      balance,
      id,
    ])

    res.json({ success: true, message: 'User updated' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.execute(`DELETE FROM users WHERE id = ?`, [id])
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})
