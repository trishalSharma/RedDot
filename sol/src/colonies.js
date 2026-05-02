const COLONY_THRESHOLD = 5   // habitats needed to form a colony
const COLONY_RADIUS_DEG = 12 // degrees lat/lng proximity

/**
 * Given all dots, find groups of 5+ habitats within radius.
 * Returns array of colony objects: { id, name, center, members }
 */
export function detectColonies(dots) {
  const habitats = dots.filter(d => d.type === 'habitat')
  const colonies = []
  const visited = new Set()

  habitats.forEach((h, i) => {
    if (visited.has(i)) return

    const cluster = [h]
    habitats.forEach((other, j) => {
      if (i === j || visited.has(j)) return
      if (_dist(h, other) < COLONY_RADIUS_DEG) {
        cluster.push(other)
      }
    })

    if (cluster.length >= COLONY_THRESHOLD) {
      cluster.forEach((_, idx) => visited.add(habitats.indexOf(cluster[idx])))

      // Colony named after first settler (oldest created_at)
      const founder = cluster.sort((a, b) =>
        new Date(a.created_at) - new Date(b.created_at)
      )[0]

      const centerLat = cluster.reduce((s, d) => s + d.lat, 0) / cluster.length
      const centerLng = cluster.reduce((s, d) => s + d.lng, 0) / cluster.length

      colonies.push({
        id: `colony_${founder.id}`,
        name: founder.name
          ? `${founder.name} Colony`
          : founder.x_handle
            ? `${founder.x_handle.replace('@', '')} Base`
            : 'Pioneer Colony',
        center: { lat: centerLat, lng: centerLng },
        members: cluster,
        founder,
      })
    }
  })

  return colonies
}

/**
 * Check if a new dot triggers a new colony.
 * Returns the new colony if formed, else null.
 */
export function checkNewColony(allDots, newDot) {
  const before = detectColonies(allDots.filter(d => d.id !== newDot.id))
  const after  = detectColonies(allDots)

  if (after.length > before.length) {
    return after[after.length - 1]
  }
  return null
}

function _dist(a, b) {
  return Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2))
}