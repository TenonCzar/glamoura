import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import process from 'process'

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      is_admin: user.is_admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function verifyToken(req) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded // contains user_id, username, is_admin
  } catch (err) {
    return null
  }
}
