import { formatCoords } from './ai.js'

const APP_URL = 'https://reddotmars.vercel.app'

const TYPE_EMOJI = {
  rocket: '🚀',
  habitat: '🏠',
  rover: '🤖',
}

/**
 * Open X share dialog with personalized OG card.
 * @param {Object} dot
 * @param {string} missionLog
 */
export function shareOnX(dot, missionLog = '') {
  if (!dot?.id) {
    console.error('❌ Missing dot id for sharing')
    return
  }

  // ✅ Safe values
const rawName = String(dot.name || 'Anonymous')

const safeName =
  rawName.length > 18
    ? rawName.slice(0, 18) + '…'
    : rawName

  const safeLat = Number(dot.lat || 0).toFixed(2)
  const safeLng = Number(dot.lng || 0).toFixed(2)

  const emoji = TYPE_EMOJI[dot.type] ?? '📍'

  const coords = formatCoords(safeLat, safeLng)

  const region = dot.region
    ? `near ${dot.region}`
    : 'on Mars'

  // ✅ IMPORTANT
  // Do NOT repeat id in query params
  const params = new URLSearchParams({
    name: safeName,
    lat: safeLat,
    lng: safeLng,
    v: Date.now(),
  })

  // ✅ Correct clean share URL
  const shareUrl =
    `${APP_URL}/dot/${dot.id}?${params.toString()}`

  // optional AI snippet
  const logSnippet = missionLog
    ? missionLog
        .split('.')[0]
        .replace(/\n/g, ' ')
        .trim() + '.'
    : ''

  // ✅ Cleaner tweet text
  const text = [
    `${emoji} ${safeName} planted a mark at ${coords} ${region}.`,
    logSnippet,
    'One planet. Eight billion dots.',
    '#SolMars #Mars',
  ]
    .filter(Boolean)
    .join('\n\n')

  // ✅ X intent URL
  const tweetUrl =
    `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` +
    `&text=${encodeURIComponent(text)}`

  window.open(
    tweetUrl,
    '_blank',
    'noopener,noreferrer'
  )
}

/**
 * Build reusable share URL
 */
export function buildDotShareUrl(dot) {
  if (!dot?.id) return APP_URL

  const params = new URLSearchParams({
    name: String(dot.name || 'Anonymous').slice(0, 18),
    lat: Number(dot.lat || 0).toFixed(2),
    lng: Number(dot.lng || 0).toFixed(2),
  })

  return `${APP_URL}/dot/${dot.id}?${params.toString()}`
}