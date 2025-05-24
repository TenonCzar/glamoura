import { createClient } from '@libsql/client'
import process from 'process'
import dotenv from 'dotenv'

dotenv.config()

export const db = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_DB_AUTH_TOKEN,
})
