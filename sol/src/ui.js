import { shareOnX } from './share.js'

/* ─── PANEL ─────────────────────────────────────────────────── */

let _selectedCoords = null
let _selectedType   = 'rocket'

export function showPanel(coords, region) {
  _selectedCoords = coords
  _selectedType   = 'rocket'

  const panel = document.getElementById('plantPanel')
  const coordsEl = document.getElementById('panelCoords')
  const regionEl = document.getElementById('panelRegion')

  coordsEl.textContent = formatCoordsShort(coords.lat, coords.lng)
  regionEl.textContent = `— ${region} —`

  // Reset form
  document.getElementById('claimName').value = ''
  document.getElementById('claimMessage').value = ''
  document.getElementById('capsuleToggle').checked = false
  document.getElementById('capsuleDate').disabled = true
  document.getElementById('capsuleDate').value = ''

  // Reset type buttons
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === 'rocket')
  })

  panel.classList.remove('hidden')
  requestAnimationFrame(() => panel.classList.add('visible'))
}

export function hidePanel() {
  const panel = document.getElementById('plantPanel')
  panel.classList.remove('visible')
  setTimeout(() => panel.classList.add('hidden'), 450)
}

export function getSelectedType() { return _selectedType }

export function bindPanelEvents(onPlant) {
  // Type selector
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _selectedType = btn.dataset.type
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
    })
  })

  // Capsule toggle
  document.getElementById('capsuleToggle').addEventListener('change', (e) => {
    document.getElementById('capsuleDate').disabled = !e.target.checked
  })

  // Cancel
document.getElementById('btnCancel').addEventListener('click', () => {
  hidePanel();
  window.globe?.resumeRotation(); // ⭐ FIX
});

  // Plant button
  document.getElementById('btnPlant').addEventListener('click', async () => {
    const name         = document.getElementById('claimName').value.trim()
    const message      = document.getElementById('claimMessage').value.trim()
    const isCapsule    = document.getElementById('capsuleToggle').checked
    const capsuleUntil = isCapsule ? document.getElementById('capsuleDate').value : null

    if (isCapsule && !capsuleUntil) {
      document.getElementById('capsuleDate').focus()
      return
    }

    const btn = document.getElementById('btnPlant')
    btn.disabled = true
    btn.textContent = 'Planting...'

    try {
      onPlant({
        lat: _selectedCoords.lat,
        lng: _selectedCoords.lng,
        type: _selectedType,
        name: name || null,
        message: message || null,
        capsule_until: capsuleUntil || null,
        x_handle: null,
      })
      hidePanel()
    } catch(err) {
      console.error(err)
    } finally {
      btn.disabled = false
      btn.textContent = 'Plant it →'
    }
  })

   const panel = document.getElementById('plantPanel');

  panel.addEventListener("click", (e) => {
    if (e.target === panel) {
      hidePanel();
      window.globe?.resumeRotation();
    }
  });
}

/* ─── TOOLTIP ────────────────────────────────────────────────── */

const TYPE_EMOJI = { rocket: '🚀', habitat: '🏠', rover: '🤖' }
const TYPE_LABEL = { rocket: 'Rocket', habitat: 'Habitat', rover: 'Rover' }

export function showTooltip(dot, clientX, clientY) {
  const el = document.getElementById('dotTooltip')
  if (!el) return

  document.getElementById('tooltipIcon').textContent    = TYPE_EMOJI[dot.type] ?? '📍'
  document.getElementById('tooltipName').textContent    = dot.name || 'Unnamed'
  document.getElementById('tooltipHandle').textContent  = dot.x_handle
    ? `@${dot.x_handle.replace('@', '')}  ·  ${TYPE_LABEL[dot.type] ?? dot.type}`
    : `@anonymous  ·  ${TYPE_LABEL[dot.type] ?? dot.type}`
  document.getElementById('tooltipCoords').textContent  = formatCoordsShort(dot.lat, dot.lng)

  // Message — hide if capsule-sealed
  const msgEl = document.getElementById('tooltipMsg')
  const isCapsuleSealed = dot.capsule_until && new Date(dot.capsule_until) > new Date()
  if (isCapsuleSealed) {
    msgEl.textContent = ''
  } else {
    msgEl.textContent = dot.message || ''
  }

  // Capsule indicator
  const capEl = document.getElementById('tooltipCapsule')
  if (isCapsuleSealed) {
    capEl.classList.remove('hidden')
    document.getElementById('tooltipCapsuleDate').textContent =
      new Date(dot.capsule_until).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
  } else {
    capEl.classList.add('hidden')
  }

  el.classList.remove('hidden')

  // Position near cursor, clamped to viewport
  requestAnimationFrame(() => {
    const w = el.offsetWidth  || 220
    const h = el.offsetHeight || 130
    const x = Math.min(clientX + 14, window.innerWidth  - w - 10)
    const y = Math.min(clientY + 14, window.innerHeight - h - 10)
    el.style.left = `${x}px`
    el.style.top  = `${y}px`
  })
}

export function hideTooltip() {
  document.getElementById('dotTooltip')?.classList.add('hidden')
}

/* ─── MISSION LOG MODAL ──────────────────────────────────────── */

let _currentLog = ''
let _currentDot = null
let _typewriterTimeout = null

export function showMissionLog(dot, coordsText) {
  _currentDot = dot
  document.getElementById('missionCoords').textContent = coordsText
  document.getElementById('missionLogText').innerHTML = `
    <div class="log-loading">
      <span class="dot-pulse"></span>
      Generating mission entry...
    </div>`
  document.getElementById('missionLogModal').classList.remove('hidden')
}

export function setMissionLogText(text) {
  _currentLog = text
  const el = document.getElementById('missionLogText')
  if (!el) return

  // Cancel any running typewriter
  if (_typewriterTimeout) clearTimeout(_typewriterTimeout)

  el.textContent = ''
  let i = 0
  const chars = text.split('')

  const tick = () => {
    if (i < chars.length) {
      el.textContent += chars[i++]
      // Auto-scroll as text fills in
      el.scrollTop = el.scrollHeight
      _typewriterTimeout = setTimeout(tick, 11)
    }
  }
  tick()
}

export function bindMissionLogEvents() {
  document.getElementById('modalBackdrop').addEventListener('click', closeMissionLog)
  document.getElementById('btnCloseMission').addEventListener('click', closeMissionLog)
  document.getElementById('btnShare').addEventListener('click', () => {
    if (_currentDot) shareOnX(_currentDot, _currentLog)
  })
}

function closeMissionLog() {
  if (_typewriterTimeout) clearTimeout(_typewriterTimeout)
  document.getElementById('missionLogModal').classList.add('hidden')
}

/* ─── DAILY COUNTER ──────────────────────────────────────────── */

export function updatePlantsCounter(remaining) {
  const el = document.getElementById('plantsLeft')
  if (el) el.textContent = remaining

  // Visual warning when 1 or 0 left
  const pill = document.getElementById('plantsCounter')
  if (pill) {
    pill.classList.toggle('low', remaining <= 1)
  }
}

/* ─── TOASTS ─────────────────────────────────────────────────── */

export function showColonyToast(colonyName) {
  _flashToast('colonyToast', `🏘️ Colony formed: ${colonyName}`)
}

export function showResourceToast(resource) {
  const el = document.getElementById('resourceToast')
  if (!el) return
  document.getElementById('resourceIcon').textContent = resource.icon
  document.getElementById('resourceText').textContent = `${resource.label} — ${resource.desc}`
  _flashToastEl(el)
}

function _flashToast(id, text) {
  const el = document.getElementById(id)
  if (!el) return
  const textEl = el.querySelector('#toastText') ?? el
  textEl.textContent = text
  _flashToastEl(el)
}

function _flashToastEl(el) {
  el.classList.remove('hidden', 'visible')
  requestAnimationFrame(() => {
    el.classList.add('visible')
    setTimeout(() => {
      el.classList.remove('visible')
      setTimeout(() => el.classList.add('hidden'), 400)
    }, 3500)
  })
}

/* ─── HELPERS ────────────────────────────────────────────────── */

function formatCoordsShort(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${latDir}  ${Math.abs(lng).toFixed(2)}°${lngDir}`
}