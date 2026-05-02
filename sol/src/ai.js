/**
 * AI Mission Log Generator
 *
 * Calls a server-side proxy (Vercel Edge Function or similar) that holds
 * the Anthropic API key. Never expose the key client-side.
 *
 * Expected proxy endpoint: POST /api/mission-log
 * Body: { lat, lng, type, name, message, region, totalDots }
 * Response: { log: "Day 47 on Mars..." }
 */

const PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || '/api/mission-log'

/**
 * Generate a mission log entry for a newly planted dot.
 * @param {Object} params - { lat, lng, type, name, message, region, totalDots }
 * @returns {Promise<string>} mission log text
 */
export async function generateMissionLog(params) {
  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) throw new Error(`Proxy error: ${res.status}`)
    const data = await res.json()
    return data.log ?? fallbackLog(params)
  } catch (err) {
    console.warn('Mission log generation failed, using fallback:', err)
    return fallbackLog(params)
  }
}

/**
 * Fallback mission log if API is unavailable.
 */
function fallbackLog({ lat, lng, type, region, totalDots }) {
  const sol = Math.floor(Math.random() * 900) + 1
  const typeLabel = { rocket: 'launch site', habitat: 'habitat module', rover: 'rover unit' }[type] ?? 'installation'
  const pct = Math.floor((totalDots / 25000) * 100)
  return `Sol ${sol}. Coordinates ${formatCoords(lat, lng)} — ${region}.\n\n` +
    `The ${typeLabel} is secured. Dust readings nominal. Horizon scan shows ${Math.floor(Math.random() * 12) + 1} other installations within 500 km.\n\n` +
    `Terraforming progress: ${pct}%. The sky here is still rust-red — but we keep planting.`
}

export function formatCoords(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${latDir} ${Math.abs(lng).toFixed(2)}°${lngDir}`
}