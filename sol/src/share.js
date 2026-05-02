import { formatCoords } from './ai.js'

const APP_URL = import.meta.env.VITE_APP_URL || 'https://sol-mars.vercel.app'

const TYPE_EMOJI = {
  rocket:  '🚀',
  habitat: '🏠',
  rover:   '🤖',
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

  // ⭐ NEW: unique share URL for this dot
  const shareUrl = `${APP_URL}/dot/${dot.id}`

  // Pull first sentence of mission log for the tweet
  const logSnippet = missionLog
    ? missionLog.split('.')[0].replace(/\n/g, ' ').trim() + '.'
    : ''

  const text = [
    `${emoji} Just planted ${name}at ${coords} ${region}.`,
    logSnippet,
    `One planet. Eight billion dots. Plant yours →`,
    shareUrl, // ⭐ UPDATED (was APP_URL before)
    `#SolMars #Mars`,
  ].filter(Boolean).join('\n\n')

  const encoded = encodeURIComponent(text)

  window.open(
    `https://x.com/intent/tweet?text=${encoded}`,
    '_blank',
    'noopener'
  )
}

/**
 * Build a share URL for a specific dot (for og:image generation).
 */
export function buildDotShareUrl(dot) {
  return `${APP_URL}/dot/${dot.id}` // ⭐ UPDATED
}