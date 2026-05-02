import * as THREE from 'three'
import { RESOURCE_TILES } from './resources.js'

const MARS_RADIUS = 2.4
const DOT_RADIUS   = 0.028
const GLOW_SEGMENTS = 12

const TYPE_COLORS = {
  rocket:  0xe8622a,
  habitat: 0x4da6ff,
  rover:   0x66cc88,
}

const TYPE_EMISSIVE = {
  rocket:  0xb83800,
  habitat: 0x0044aa,
  rover:   0x006633,
}

const TYPE_EMISSIVE_INTENSITY = {
  rocket:  1.2,
  habitat: 1.4,
  rover:   1.2,
}

export class MarsGlobe {
  constructor(canvas, onClickCoords, onHoverDot) {
    this.canvas = canvas
    this.onClickCoords = onClickCoords
    this.onHoverDot    = onHoverDot

    this.dots = []
    this.hoveredDot = null
    this.isDragging = false
    this.mouseDownPos = { x: 0, y: 0 }
    this.terraformPct = 0

    this.isAutoRotating = true // ⭐ NEW
     this.rotVelocity = { x: 0, y: 0 }

    this._init()
    this._animate()
  }

  /* ── SETUP ──────────────────────────────────────────────── */
  _init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    this.camera.position.set(0, 0, 7)

    // Lights — warmer, more dramatic
    const ambient = new THREE.AmbientLight(0x301008, 0.8)
    this.scene.add(ambient)

    const sun = new THREE.DirectionalLight(0xffddbb, 2.5)
    sun.position.set(5, 3, 5)
    this.scene.add(sun)

    const fill = new THREE.DirectionalLight(0x100508, 0.4)
    fill.position.set(-5, -2, -3)
    this.scene.add(fill)

    // Subtle rim light
    const rim = new THREE.DirectionalLight(0x4466aa, 0.15)
    rim.position.set(-3, 0, -5)
    this.scene.add(rim)

    this._addStars()
    this._addMars()
    this._addAtmosphere()
    this._addAtmosphereRim()
    this._addResourceMarkers()

    this.autoRotateSpeed = 0.0008
    this.isDragging = false
    this.prevMouse = { x: 0, y: 0 }
    this.rotVelocity = { x: 0, y: 0 }
    this.marsMesh.rotation.y = Math.PI * 0.6

    this._bindEvents()

    this.raycaster = new THREE.Raycaster()
    this.raycaster.params.Points.threshold = 0.1
    this.mouse = new THREE.Vector2()
  }

  /* ── STARS ──────────────────────────────────────────────── */
  _addStars() {
    // Layer 1 — small distant stars
    const geo1 = new THREE.BufferGeometry()
    const count1 = 3000
    const pos1 = new Float32Array(count1 * 3)
    for (let i = 0; i < count1 * 3; i++) pos1[i] = (Math.random() - 0.5) * 200
    geo1.setAttribute('position', new THREE.BufferAttribute(pos1, 3))
    this.scene.add(new THREE.Points(geo1, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.6,
    })))

    // Layer 2 — slightly larger brighter stars
    const geo2 = new THREE.BufferGeometry()
    const count2 = 400
    const pos2 = new Float32Array(count2 * 3)
    for (let i = 0; i < count2 * 3; i++) pos2[i] = (Math.random() - 0.5) * 180
    geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3))
    this.scene.add(new THREE.Points(geo2, new THREE.PointsMaterial({
      color: 0xfff4e8, size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.9,
    })))
  }

  /* ── MARS SPHERE ────────────────────────────────────────── */
  _addMars() {
    const geo = new THREE.SphereGeometry(MARS_RADIUS, 64, 64)

    this.marsMaterial = new THREE.MeshStandardMaterial({
      color: 0xb84020,
      roughness: 0.92,
      metalness: 0.02,
    })

    const loader = new THREE.TextureLoader()
    loader.load(
      '/textures/mars.jpg',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        this.marsMaterial.map = tex
        this.marsMaterial.color.set(0xffffff) // let texture define color
        this.marsMaterial.needsUpdate = true
        
      },
      undefined,
      () => {
        console.info('⚠️ Mars texture not found — using fallback color')
      }
    )

    this.marsMesh = new THREE.Mesh(geo, this.marsMaterial)
    this.marsGroup = new THREE.Group()
    this.marsGroup.add(this.marsMesh)
    this.scene.add(this.marsGroup)

    // North ice cap
    const capGeo = new THREE.SphereGeometry(MARS_RADIUS * 1.003, 48, 24, 0, Math.PI * 2, 0, 0.22)
    this.northCap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({
      color: 0xe8f4ff,
      transparent: true,
      opacity: 0.0,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xaaccff,
      emissiveIntensity: 0.0,
    }))
    this.marsGroup.add(this.northCap)

    // South ice cap
    const southCapGeo = new THREE.SphereGeometry(MARS_RADIUS * 1.003, 48, 24, 0, Math.PI * 2, Math.PI - 0.22, 0.22)
    this.southCap = new THREE.Mesh(southCapGeo, new THREE.MeshStandardMaterial({
      color: 0xe8f4ff,
      transparent: true,
      opacity: 0.0,
      roughness: 0.2,
      metalness: 0.1,
      emissive: 0xaaccff,
      emissiveIntensity: 0.0,
    }))
    this.marsGroup.add(this.southCap)
  }

  /* ── ATMOSPHERE ─────────────────────────────────────────── */
  _addAtmosphere() {
    const geo = new THREE.SphereGeometry(MARS_RADIUS * 1.06, 48, 48)
    this.atmosphereMat = new THREE.MeshStandardMaterial({
      color: 0xc1440e,
      transparent: true,
      opacity: 0.055,
      side: THREE.FrontSide,
      depthWrite: false,
    })
    this.atmosphereMesh = new THREE.Mesh(geo, this.atmosphereMat)
    this.scene.add(this.atmosphereMesh)
  }

  /* ── ATMOSPHERE RIM GLOW ────────────────────────────────── */
  _addAtmosphereRim() {
    // Backlit atmospheric rim — always visible, shifts color with terraforming
    const geo = new THREE.SphereGeometry(MARS_RADIUS * 1.12, 48, 48)
    this.rimMat = new THREE.MeshBasicMaterial({
      color: 0x8b2000,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      depthWrite: false,
    })
    this.rimMesh = new THREE.Mesh(geo, this.rimMat)
    this.scene.add(this.rimMesh)
  }

  /* ── RESOURCE MARKERS ───────────────────────────────────── */
  _addResourceMarkers() {
    RESOURCE_TILES.forEach(tile => {
      const pos = this._latLngToVec3(tile.lat, tile.lng, MARS_RADIUS * 1.005)
      const geo = new THREE.CircleGeometry(0.07, 6)
      const mat = new THREE.MeshBasicMaterial({
        color: tile.color,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.copy(pos)
      const outward = pos.clone().normalize()
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), outward)
      this.marsGroup.add(mesh)
    })
  }

  /* ── DOTS ───────────────────────────────────────────────── */
  addDot(dotData) {
    const { lat, lng, type } = dotData
    const pos = this._latLngToVec3(lat, lng, MARS_RADIUS + DOT_RADIUS * 0.6)

    const geo = new THREE.SphereGeometry(DOT_RADIUS, GLOW_SEGMENTS, GLOW_SEGMENTS)
    const mat = new THREE.MeshStandardMaterial({
      color: TYPE_COLORS[type] ?? 0xffffff,
      emissive: TYPE_EMISSIVE[type] ?? 0x222222,
      emissiveIntensity: TYPE_EMISSIVE_INTENSITY[type] ?? 1.0,
      roughness: 0.2,
      metalness: 0.15,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.copy(pos)
    mesh.userData = dotData

    // Glow halo
    const glowGeo = new THREE.SphereGeometry(DOT_RADIUS * 2.2, 8, 8)
    const glowMat = new THREE.MeshBasicMaterial({
      color: TYPE_COLORS[type] ?? 0xffffff,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    })
    const glowMesh = new THREE.Mesh(glowGeo, glowMat)
    mesh.add(glowMesh)

    this.marsGroup.add(mesh)
    this.dots.push({ mesh, data: dotData })

    // Spring scale animation: 0 → 1.3 → 1
    mesh.scale.setScalar(0)
    let t = 0
    const grow = () => {
      t += 0.07
      if (t < 1.5) {
        const s = t < 1 ? t : 1 + Math.sin((t - 1) * Math.PI) * 0.3 * (1.5 - t)
        mesh.scale.setScalar(Math.max(0, s))
        requestAnimationFrame(grow)
      } else {
        mesh.scale.setScalar(1)
      }
    }
    grow()

    return mesh
  }

  loadDots(dotsArray) {
    dotsArray.forEach(d => this.addDot(d))
  }

  /* ── TERRAFORMING VISUAL ────────────────────────────────── */
  setTerraformProgress(pct) {
    this.terraformPct = pct
    const t = pct / 100

    // Ice caps — opacity + emissive glow
    const capOpacity = t * 0.85
    const capEmissive = t * 0.3
    this.northCap.material.opacity = capOpacity
    this.northCap.material.emissiveIntensity = capEmissive
    this.southCap.material.opacity = capOpacity
    this.southCap.material.emissiveIntensity = capEmissive

    // Atmosphere color: rust-orange → blue-green
    const r = THREE.MathUtils.lerp(193, 50,  t)
    const g = THREE.MathUtils.lerp(68,  150, t)
    const b = THREE.MathUtils.lerp(14,  200, t)
    this.atmosphereMat.color.setRGB(r / 255, g / 255, b / 255)
    this.atmosphereMat.opacity = 0.055 + t * 0.15

    // Rim glow
    this.rimMat.color.setRGB(
      THREE.MathUtils.lerp(0.55, 0.1, t),
      THREE.MathUtils.lerp(0.12, 0.35, t),
      THREE.MathUtils.lerp(0.0,  0.6,  t)
    )
    this.rimMat.opacity = 0.08 + t * 0.1

    // Surface color: dusty red → slightly green-tinted
    if (!this.marsMaterial.map) {
      // Only shift base color if no texture loaded
      const marsR = THREE.MathUtils.lerp(0.72, 0.45, t * 0.6)
      const marsG = THREE.MathUtils.lerp(0.25, 0.38, t * 0.6)
      const marsB = THREE.MathUtils.lerp(0.13, 0.20, t * 0.6)
      this.marsMaterial.color.setRGB(marsR, marsG, marsB)
    }
  }

  /* ── RAYCASTING ─────────────────────────────────────────── */
  _getIntersects(event) {
    const rect = this.canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width)  * 2 - 1
    const y = -((event.clientY - rect.top)  / rect.height) * 2 + 1
    this.mouse.set(x, y)
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // Check dots first — slightly enlarged hitbox for usability
    const dotMeshes = this.dots.map(d => d.mesh)
    this.raycaster.params.Mesh = { threshold: 0.05 }
    const dotHits = this.raycaster.intersectObjects(dotMeshes, false)
    if (dotHits.length > 0) {
      return { type: 'dot', dot: dotHits[0].object.userData, point: dotHits[0].point }
    }

    const globeHits = this.raycaster.intersectObject(this.marsMesh)
    if (globeHits.length > 0) {
      return { type: 'globe', point: globeHits[0].point }
    }

    return null
  }

  _worldToLatLng(point) {
    const local = point.clone()
    this.marsGroup.worldToLocal(local)
    local.normalize()
    const lat = THREE.MathUtils.radToDeg(Math.asin(local.y))
    const lng = THREE.MathUtils.radToDeg(Math.atan2(-local.z, local.x))
    return { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) }
  }

  _latLngToVec3(lat, lng, radius) {
    const phi   = THREE.MathUtils.degToRad(90 - lat)
    const theta = THREE.MathUtils.degToRad(lng)
    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      -radius * Math.sin(phi) * Math.sin(theta)
    )
  }

  /* ── EVENTS ─────────────────────────────────────────────── */
  _bindEvents() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = false
      this.mouseDownPos = { x: e.clientX, y: e.clientY }
      this.prevMouse = { x: e.clientX, y: e.clientY }
      this._isMouseDown = true
    })

    this.canvas.addEventListener('mousemove', (e) => {
      const dx = e.clientX - this.mouseDownPos.x
      const dy = e.clientY - this.mouseDownPos.y
      if (this._isMouseDown && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        this.isDragging = true
      }

      if (this._isMouseDown && this.isDragging) {
        const deltaX = e.clientX - this.prevMouse.x
        const deltaY = e.clientY - this.prevMouse.y
        this.rotVelocity.y = deltaX * 0.005
        this.rotVelocity.x = deltaY * 0.005
        this.marsGroup.rotation.y += this.rotVelocity.y
        this.marsGroup.rotation.x += this.rotVelocity.x
        this.marsGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.marsGroup.rotation.x))
        this.prevMouse = { x: e.clientX, y: e.clientY }
      }

      if (!this._isMouseDown) {
        const hit = this._getIntersects(e)
        if (hit?.type === 'dot') {
          this.canvas.style.cursor = 'pointer'
          this.onHoverDot && this.onHoverDot(hit.dot, e.clientX, e.clientY)
        } else {
          this.canvas.style.cursor = hit ? 'crosshair' : 'default'
          this.onHoverDot && this.onHoverDot(null)
        }
      }
    })

    this.canvas.addEventListener('mouseup', (e) => {
  this._isMouseDown = false

  if (!this.isDragging) {
    const hit = this._getIntersects(e)

    // 🌍 GLOBE CLICK → open panel
    if (hit?.type === 'globe') {
      this.isAutoRotating = false
      this.rotVelocity = { x: 0, y: 0 }

      const coords = this._worldToLatLng(hit.point)
      this.onClickCoords && this.onClickCoords(coords)
    }

    // 📍 DOT CLICK → ONLY stop + show tooltip
    if (hit?.type === 'dot') {
      this.isAutoRotating = false
      this.rotVelocity = { x: 0, y: 0 }

      this.onHoverDot && this.onHoverDot(hit.dot, e.clientX, e.clientY)

      return // ⭐ VERY IMPORTANT → stops further execution
    }
  }

  this.isDragging = false
})

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      this.camera.position.z = Math.max(4, Math.min(12, this.camera.position.z + e.deltaY * 0.008))
      this.camera.updateProjectionMatrix()
    }, { passive: false })

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    })

    /* ── TOUCH ──────────────────────────────────────────── */
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const t = e.touches[0]
      this.isDragging = false
      this.mouseDownPos = { x: t.clientX, y: t.clientY }
      this.prevMouse    = { x: t.clientX, y: t.clientY }
      this._isMouseDown = true
      this._touchStartTime = Date.now()
    }, { passive: false })

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const t = e.touches[0]
      const dx = t.clientX - this.mouseDownPos.x
      const dy = t.clientY - this.mouseDownPos.y
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) this.isDragging = true

      if (this.isDragging) {
        const deltaX = t.clientX - this.prevMouse.x
        const deltaY = t.clientY - this.prevMouse.y
        this.rotVelocity.y = deltaX * 0.005
        this.rotVelocity.x = deltaY * 0.005
        this.marsGroup.rotation.y += this.rotVelocity.y
        this.marsGroup.rotation.x += this.rotVelocity.x
        this.marsGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.marsGroup.rotation.x))
        this.prevMouse = { x: t.clientX, y: t.clientY }
      }
    }, { passive: false })

  this.canvas.addEventListener('touchend', (e) => {
  e.preventDefault();

  this._isMouseDown = false;

  const elapsed = Date.now() - (this._touchStartTime ?? 0);

  if (!this.isDragging && elapsed < 300) {
    const touch = e.changedTouches[0];

    const hit = this._getIntersects({
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    // 📍 DOT CLICK → stop + tooltip ONLY
    if (hit?.type === 'dot') {
      this.isAutoRotating = false;
      this.rotVelocity = { x: 0, y: 0 };

      this.onHoverDot && this.onHoverDot(hit.dot, touch.clientX, touch.clientY);

      // auto-hide tooltip after 2.8s
      setTimeout(() => {
        this.onHoverDot && this.onHoverDot(null);
      }, 2800);

      return; // ⭐ VERY IMPORTANT → prevents globe logic
    }

    // 🌍 GLOBE CLICK → open panel
    if (hit?.type === 'globe') {
      this.isAutoRotating = false;
      this.rotVelocity = { x: 0, y: 0 };

      const coords = this._worldToLatLng(hit.point);
      this.onClickCoords && this.onClickCoords(coords);
    }
  }

  this.isDragging = false;

}, { passive: false });

    // Pinch zoom
    this._lastPinchDist = null
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 2) return
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (this._lastPinchDist !== null) {
        const delta = this._lastPinchDist - dist
        this.camera.position.z = Math.max(4, Math.min(12, this.camera.position.z + delta * 0.02))
        this.camera.updateProjectionMatrix()
      }
      this._lastPinchDist = dist
    }, { passive: true })

    this.canvas.addEventListener('touchend', () => { this._lastPinchDist = null })
  }

  /* ── ANIMATION LOOP ─────────────────────────────────────── */
  _animate() {
    requestAnimationFrame(() => this._animate())

   if (this.isAutoRotating) {
  this.marsGroup.rotation.y += this.autoRotateSpeed
 
}

    // Subtle dot pulse on hovered dot
    if (this._hoveredDotMesh) {
      const s = 1 + Math.sin(Date.now() * 0.004) * 0.08
      this._hoveredDotMesh.scale.setScalar(s)
    }

    this.renderer.render(this.scene, this.camera)
  }

  /* ── PUBLIC: highlight a dot on hover ───────────────────── */
  highlightDot(dotData) {
    if (this._hoveredDotMesh) {
      this._hoveredDotMesh.scale.setScalar(1)
      this._hoveredDotMesh = null
    }
    if (dotData) {
      const found = this.dots.find(d => d.data === dotData || d.data.id === dotData.id)
      if (found) this._hoveredDotMesh = found.mesh
    }
  }
  resumeRotation() {
  this.isAutoRotating = true;
   this.rotVelocity = { x: 0, y: 0 };
}
}