// Mars resource tiles — real approximate locations of known deposits
// Colors used for faint surface markers on the globe

export const RESOURCE_TILES = [
    // Water ice deposits
    { id: 'ice_north',    lat:  85,    lng:   0,   type: 'ice',    label: 'Polar Ice Sheet',      icon: '🧊', color: 0x88ccff, desc: 'Vast water ice reservoir beneath the northern polar cap.' },
    { id: 'ice_south',    lat: -85,    lng:   0,   type: 'ice',    label: 'South Polar Ice',       icon: '🧊', color: 0xaaddff, desc: 'Dry ice and water ice mixed in the south polar layered deposits.' },
    { id: 'ice_mid',      lat:  45,    lng:  150,  type: 'ice',    label: 'Mid-latitude Ice',      icon: '🧊', color: 0x88ccff, desc: 'Subsurface water ice confirmed by radar.' },
  
    // Lava tubes
    { id: 'lava_olympus', lat:  18.4,  lng: -133,  type: 'lava',   label: 'Olympus Mons Tubes',   icon: '🌋', color: 0xff6633, desc: 'Ancient lava tubes beneath the solar system\'s largest volcano.' },
    { id: 'lava_tharsis', lat:   0,    lng: -90,   type: 'lava',   label: 'Tharsis Lava Fields',  icon: '🌋', color: 0xff6633, desc: 'Enormous volcanic plain with potential underground shelter.' },
  
    // Ore/mineral zones
    { id: 'ore_valles',   lat:  -4,    lng: -70,   type: 'ore',    label: 'Valles Marineris Ore', icon: '⛏️', color: 0xddaa44, desc: 'Iron and hematite deposits exposed by the great canyon system.' },
    { id: 'ore_hellas',   lat: -42,    lng:  70,   type: 'ore',    label: 'Hellas Basin Metals',  icon: '⛏️', color: 0xddaa44, desc: 'Deep impact basin rich in metal oxides.' },
  
    // Special
    { id: 'curiosity',    lat:  -4.6,  lng: 137.4, type: 'historic', label: 'Curiosity Rover Site', icon: '🤖', color: 0x88ff88, desc: 'Gale Crater — where Curiosity has roamed since 2012.' },
    { id: 'perseverance', lat:  18.4,  lng:  77.5, type: 'historic', label: 'Jezero Crater',         icon: '🤖', color: 0x88ff88, desc: 'Ancient river delta — Perseverance\'s search for ancient life.' },
    { id: 'olympus',      lat:  18.65, lng: -133.8, type: 'landmark', label: 'Olympus Mons Summit',  icon: '🏔️', color: 0xffaaaa, desc: 'The tallest volcano in the solar system. 21 km high.' },
  ]
  
  /**
   * Check if a coordinate is within radius of a resource tile.
   * @param {number} lat
   * @param {number} lng
   * @returns {Object|null} resource tile or null
   */
  export function checkResourceTile(lat, lng) {
    const THRESHOLD = 8 // degrees
    for (const tile of RESOURCE_TILES) {
      const dLat = Math.abs(tile.lat - lat)
      const dLng = Math.abs(tile.lng - lng)
      if (dLat < THRESHOLD && dLng < THRESHOLD) return tile
    }
    return null
  }
  
  /**
   * Get a human-readable region name based on coords.
   * Rough approximation using known Mars geography.
   */
  export function getRegionName(lat, lng) {
    if (lat > 70)  return 'North Polar Region'
    if (lat < -70) return 'South Polar Region'
    if (lat > 10 && lng > -150 && lng < -120) return 'near Olympus Mons'
    if (lat > -10 && lng > -90 && lng < -30)  return 'Tharsis Plateau'
    if (lat > -10 && lng > -80 && lng < -30)  return 'Valles Marineris'
    if (lat < -30 && lng > 60 && lng < 100)   return 'Hellas Basin'
    if (lat > 0  && lat < 30 && lng > 130 && lng < 160) return 'Elysium Mons'
    if (lat > -10 && lat < 10 && lng > 100 && lng < 150) return 'Amazonis Planitia'
    return 'open terrain'
  }