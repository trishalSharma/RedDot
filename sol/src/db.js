import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/* ─── DOTS ──────────────────────────────────────────────────── */

/**
 * Fetch all planted dots.
 * Returns array of dot objects.
 */
export async function getAllDots() {
  const { data, error } = await supabase
    .from('dots')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getAllDots:', error); return [] }
  return data
}

/**
 * Plant a new dot.
 * @param {Object} dot - { lat, lng, type, name, message, x_handle, capsule_until }
 */
export async function plantDot(dot) {
  const { data, error } = await supabase
    .from('dots')
    .insert([dot])
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Subscribe to new dots in realtime.
 * @param {Function} callback - called with each new dot
 */
export function subscribeToNewDots(callback) {
  return supabase
    .channel('dots-realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dots' }, (payload) => {
      callback(payload.new)
    })
    .subscribe()
}

/* ─── TERRAFORMING PROGRESS ─────────────────────────────────── */

/**
 * Get total dot count (used to calculate terraforming %).
 */
export async function getTotalDotCount() {
  const { count, error } = await supabase
    .from('dots')
    .select('*', { count: 'exact', head: true })
  if (error) { console.error('getTotalDotCount:', error); return 0 }
  return count
}

/* ─── LOCAL DAILY LIMIT ──────────────────────────────────────── */
// Stored in localStorage — 3 plants per day per device.
const DAILY_KEY = 'sol_daily'
const DAILY_LIMIT = 3

export function getDailyUsage() {
  const raw = localStorage.getItem(DAILY_KEY)
  if (!raw) return { count: 0, date: today() }
  try {
    const parsed = JSON.parse(raw)
    if (parsed.date !== today()) return { count: 0, date: today() }
    return parsed
  } catch { return { count: 0, date: today() } }
}

export function incrementDailyUsage() {
  const usage = getDailyUsage()
  usage.count++
  localStorage.setItem(DAILY_KEY, JSON.stringify(usage))
  return usage
}

export function getPlantsRemaining() {
  return Math.max(0, DAILY_LIMIT - getDailyUsage().count)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}