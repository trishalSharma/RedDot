import './style.css'

import { MarsGlobe } from './globe.js'
import {
  getAllDots,
  plantDot,
  subscribeToNewDots,
  getTotalDotCount,
  getPlantsRemaining,
  incrementDailyUsage,
} from './db.js'
import {
  showPanel, hidePanel, bindPanelEvents, bindMissionLogEvents,
  showTooltip, hideTooltip,
  showMissionLog, setMissionLogText,
  updatePlantsCounter,
  showColonyToast, showResourceToast,
} from './ui.js'
import { checkResourceTile, getRegionName } from './resources.js'
import { checkNewColony } from './colonies.js'
import { calcTerraformPct, updateProgressUI } from './terraforming.js'
import { generateMissionLog, formatCoords } from './ai.js'

/* ─── STATE ─────────────────────────────────────────────────── */
let allDots     = []
let totalCount  = 0
let globe       = null

/* ─── LOADING HELPERS ────────────────────────────────────────── */
function setLoadProgress(pct, status = '') {
  const bar = document.getElementById('loadingBar')
  if (bar) bar.style.width = `${pct}%`
  const statusEl = document.getElementById('loadingStatus')
  if (statusEl && status) statusEl.textContent = status
}

function hideLoadingScreen() {
  const el = document.getElementById('loadingScreen')
  if (el) {
    el.classList.add('fade-out')
    setTimeout(() => { el.style.display = 'none' }, 1200)
  }
}

/* ─── HARD TIMEOUT (8s max per SRS) ─────────────────────────── */
const LOAD_TIMEOUT = setTimeout(() => {
  hideLoadingScreen()
}, 8000)

/* ─── INIT ──────────────────────────────────────────────────── */
async function init() {
  setLoadProgress(10, 'initialising globe...')

  globe = new MarsGlobe(

    document.getElementById('marsCanvas'),
    handleGlobeClick,
    handleDotHover,
  )
  window.globe = globe; // ⭐ expose globally
  setLoadProgress(35, 'globe ready')

  // Load existing dots
  setLoadProgress(45, 'fetching explorer data...')
  allDots = await getAllDots()
  setLoadProgress(65, `loaded ${allDots.length} dots`)
  globe.loadDots(allDots)
  setLoadProgress(78, 'rendering surface...')

  // Terraforming progress
  totalCount = await getTotalDotCount()
  const pct = calcTerraformPct(totalCount)
  updateProgressUI(pct)
  globe.setTerraformProgress(pct)
  setLoadProgress(92, 'syncing realtime...')

  // Daily counter
  updatePlantsCounter(getPlantsRemaining())

  // Realtime: new dots from other users
  subscribeToNewDots((newDot) => {
    if (!allDots.find(d => d.id === newDot.id)) {
      allDots.push(newDot)
      globe.addDot(newDot)
      totalCount++
      const newPct = calcTerraformPct(totalCount)
      updateProgressUI(newPct)
      globe.setTerraformProgress(newPct)
    }
  })

  // Bind UI events
  bindPanelEvents(handlePlant)
  bindMissionLogEvents()

  document.getElementById('btnViewMine')?.addEventListener('click', () => {
    showInfoToast('🌑 Sign in with X to track your dots across sessions. (Coming soon)')
  })

  setLoadProgress(100, 'welcome, pioneer')
  clearTimeout(LOAD_TIMEOUT)
  setTimeout(hideLoadingScreen, 500)
}

/* ─── GLOBE CLICK ────────────────────────────────────────────── */
function handleGlobeClick(coords) {
  if (getPlantsRemaining() <= 0) {
    showDailyLimitMessage()
    return
  }
  const region = getRegionName(coords.lat, coords.lng)
  showPanel(coords, region)
}

/* ─── DOT HOVER ──────────────────────────────────────────────── */
function handleDotHover(dot, clientX, clientY) {
  if (!dot) {
    hideTooltip()
    globe?.highlightDot(null)
    return
  }
  showTooltip(dot, clientX, clientY)
  globe?.highlightDot(dot)
}




/* ─── PLANT ──────────────────────────────────────────────────── */



async function handlePlant(dotInput) {

  // ⭐ resume immediately (UI already closed)
  globe?.resumeRotation();

  const remaining = getPlantsRemaining();

  if (remaining <= 0) return;

  dotInput.region = getRegionName(dotInput.lat, dotInput.lng);

  let planted;

  try {
    planted = await plantDot(dotInput);
  } catch (err) {
    console.error(err);
    return;
  }


  // Add to local state + globe
  allDots.push(planted)
  globe.addDot(planted)

  // Update daily counter
  const usage = incrementDailyUsage()
  const left = Math.max(0, 3 - usage.count)
  updatePlantsCounter(left)

  // Update terraforming
  totalCount++
  const newPct = calcTerraformPct(totalCount)
  updateProgressUI(newPct)
  globe.setTerraformProgress(newPct)

  // Resource tile check
  const resource = checkResourceTile(planted.lat, planted.lng)
  if (resource) showResourceToast(resource)

  // Colony check
  const newColony = checkNewColony(allDots, planted)
  if (newColony) showColonyToast(newColony.name)

  // Mission log modal
  const coordsText = formatCoords(planted.lat, planted.lng)
  showMissionLog(planted, coordsText)

   globe?.resumeRotation();
   console.log("RESUME CALLED FROM MAIN");

  // Generate AI mission log
  generateMissionLog({
    lat:       planted.lat,
    lng:       planted.lng,
    type:      planted.type,
    name:      planted.name,
    message:   planted.message,
    region:    planted.region,
    totalDots: totalCount,
  }).then(log => setMissionLogText(log))
  .catch(err => console.error(err));
  // ⭐ RESUME ROTATION AFTER PLANT
}



/* ─── DAILY LIMIT ────────────────────────────────────────────── */
function showDailyLimitMessage() {
  showInfoToast('🌑 You\'ve used all 3 plants for today. Come back tomorrow.')
}

/* ─── GENERIC INFO TOAST ─────────────────────────────────────── */
function showInfoToast(text) {
  const el = document.getElementById('colonyToast')
  if (!el) return
  const textEl = document.getElementById('toastText')
  if (textEl) textEl.textContent = text
  el.classList.remove('hidden', 'visible')
  requestAnimationFrame(() => {
    el.classList.add('visible')
    setTimeout(() => {
      el.classList.remove('visible')
      setTimeout(() => el.classList.add('hidden'), 400)
    }, 3500)
  })
}

/* ─── START ──────────────────────────────────────────────────── */
init().catch(err => {
  console.error('Init failed:', err)
  hideLoadingScreen()
})