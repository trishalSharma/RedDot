// api/expire.js
import { createClient } from '@supabase/supabase-js'

export const config = { runtime: 'edge' }

export default async function handler(req) {
  // Protect the endpoint — only Vercel Cron can call it
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
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
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  return new Response(JSON.stringify({ deleted: count }), { status: 200 })
}