import { createCanvas, loadImage } from 'canvas'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  try {
    const { id = '123', lat = '15.53', lng = '99.47' } = req.query

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 🌌 CINEMATIC BACKGROUND
    const bg = ctx.createLinearGradient(0, 0, 0, height)
    bg.addColorStop(0, '#020202')
    bg.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // soft vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      200,
      width / 2,
      height / 2,
      800
    )
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)

    // 🌍 LOAD MARS (reliable)
    const mars = await loadImage(
      'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
    )

    const cx = width / 2
    const cy = height / 2 - 10
    const r = 210

    // 🌫️ ATMOSPHERE GLOW (key detail)
    const atmosphere = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 40)
    atmosphere.addColorStop(0, 'rgba(255,120,60,0.15)')
    atmosphere.addColorStop(1, 'rgba(255,120,60,0)')
    ctx.fillStyle = atmosphere
    ctx.beginPath()
    ctx.arc(cx, cy, r + 30, 0, Math.PI * 2)
    ctx.fill()

    // 🌍 DRAW MARS
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(mars, cx - r, cy - r, r * 2, r * 2)
    ctx.restore()

    // 🌑 SHADOW (depth)
    const shadow = ctx.createRadialGradient(
      cx + 90,
      cy + 30,
      50,
      cx,
      cy,
      r
    )
    shadow.addColorStop(0, 'rgba(0,0,0,0)')
    shadow.addColorStop(1, 'rgba(0,0,0,0.65)')
    ctx.fillStyle = shadow
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // ✨ HIGHLIGHT
    const highlight = ctx.createRadialGradient(
      cx - 140,
      cy - 140,
      10,
      cx,
      cy,
      r
    )
    highlight.addColorStop(0, 'rgba(255,255,255,0.12)')
    highlight.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = highlight
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // 🔴 DOT (subtle but sharp)
    const dotX = cx + 120
    const dotY = cy - 20

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 28)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 28, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
    ctx.fill()

    // 🧠 TYPOGRAPHY (this is where most apps fail)

    ctx.textAlign = 'center'

    // title
    ctx.fillStyle = '#ffffff'
    ctx.font = '600 58px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText('I planted on Mars', width / 2, 90)

    // subtitle (lighter, spaced)
    ctx.font = '400 26px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#9aa0a6'
    ctx.fillText(
      `${lat}°N · ${lng}°W`,
      width / 2,
      height - 110
    )

    // dot id
    ctx.font = '400 22px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#666'
    ctx.fillText(`Dot #${id}`, width / 2, height - 70)

    // brand (very subtle)
    ctx.font = '400 18px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillStyle = '#333'
    ctx.fillText('reddotmars.vercel.app', width / 2, height - 30)

    const buffer = canvas.toBuffer('image/png')

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Length', buffer.length)

    res.status(200).end(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('OG failed')
  }
}