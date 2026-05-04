// api/expire.js
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'nodejs' } // ✅ changed from 'edge' to 'nodejs'

export default async function handler(req, res) {
  // Protect the endpoint — only Vercel Cron can call it
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).end('Unauthorized')
    return
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { error, count } = await supabase
    .from('dots')
    .delete({ count: 'exact' })
    .eq('is_pioneer', false)
    .not('expires_at', 'is', null)
    .lt('expires_at', new Date().toISOString())

  if (error) {
    res.status(500).json({ error })
    return
  }

  res.status(200).json({ deleted: count })
}