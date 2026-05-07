import { formatCoords } from './ai.js'

const APP_URL = 'https://reddotmars.vercel.app'

const TYPE_EMOJI = {
  rocket: '🚀',
  habitat: '🏠',
  rover: '🤖',
}

/**
 * Open X share dialog with a pre-composed tweet.
 * @param {Object} dot - { lat, lng, type, name, region, id }
 * @param {string} missionLog - AI-generated mission log text
 */
export function shareOnX(dot, missionLog = '') {
  if (!dot?.id) {
    console.error('❌ Missing dot id for sharing')
    return
  }

  const emoji = TYPE_EMOJI[dot.type] ?? '📍'
  const coords = formatCoords(dot.lat, dot.lng)
  const name = dot.name ? `"${dot.name}" ` : ''
  const region = dot.region ? `near ${dot.region}` : 'on Mars'

  // ✅ Clean URL — no cache busting params
const params = new URLSearchParams({
  id: dot.id,
  name: dot.name || 'Anonymous',
  lat: dot.lat,
  lng: dot.lng,
  v: Date.now(),
})

const shareUrl = `${APP_URL}/dot/${dot.id}?${params.toString()}`

  // Clean first sentence
  const logSnippet = missionLog
    ? missionLog.split('.')[0].replace(/\n/g, ' ').trim() + '.'
    : ''

  // ✅ CLEAN TEXT (no URL inside)
  const text = [
    `${emoji} Just planted ${name}at ${coords} ${region}.`,
    logSnippet,
    `One planet. Eight billion dots.`,
    `#SolMars #Mars`,
  ]
    .filter(Boolean)
    .join('\n\n')

  // ✅ IMPORTANT: url FIRST (more reliable parsing by X)
  const tweetUrl =
    `https://x.com/intent/tweet?url=${encodeURIComponent(shareUrl)}` +
    `&text=${encodeURIComponent(text)}`

  window.open(tweetUrl, '_blank', 'noopener,noreferrer')
}

/**
 * Build a share URL for a specific dot
 */
export function buildDotShareUrl(dot) {
  if (!dot?.id) return APP_URL
  return `${APP_URL}/dot/${dot.id}`
}