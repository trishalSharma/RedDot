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
 * @param {string} missionLog - the AI-generated mission log text (first sentence)
 */
export function shareOnX(dot, missionLog = '') {
  const emoji = TYPE_EMOJI[dot.type] ?? '📍'
  const coords = formatCoords(dot.lat, dot.lng)
  const name = dot.name ? `"${dot.name}" ` : ''
  const region = dot.region ? `near ${dot.region}` : 'on Mars'

  // ✅ IMPORTANT: unique share URL (with cache buster)
  const shareUrl = `${APP_URL}/dot/${dot.id}?v=${Date.now()}`

  // Extract first sentence
  const logSnippet = missionLog
    ? missionLog.split('.')[0].replace(/\n/g, ' ').trim() + '.'
    : ''

  const text = [
  `${emoji} Just planted ${name}at ${coords} ${region}.`,
  logSnippet,
  `One planet. Eight billion dots.`,
  `#SolMars #Mars`,
].join('\n\n')

  // ✅ KEY FIX: use url= parameter
  const tweetUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(text)}`

  window.open(tweetUrl, '_blank', 'noopener')
}

/**
 * Build a share URL for a specific dot
 */
export function buildDotShareUrl(dot) {
  return `${APP_URL}/dot/${dot.id}`
}