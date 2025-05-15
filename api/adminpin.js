import process from "process";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { pin } = req.body

  if (pin === process.env.ADMIN_ACCESS_PIN) {
    return res.status(200).json({ success: true })
  } else {
    return res.status(403).json({ error: 'Invalid pin' })
  }
}
