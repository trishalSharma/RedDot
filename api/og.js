import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

export const config = {
  runtime: 'nodejs',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Fonts
registerFont(path.join(__dirname, 'fonts/Inter-Bold.ttf'), {
  family: 'Inter',
  weight: 'bold',
})

registerFont(path.join(__dirname, 'fonts/Inter-Regular.ttf'), {
  family: 'Inter',
  weight: 'normal',
})

export default async function handler(req, res) {
  try {
    // ✅ Dynamic data
    const {
      id = '123',
      lat = '15.53',
      lng = '99.47',
      name = 'Anonymous',
    } = req.query

    // ✅ Safe username
    const rawName = String(name || 'Anonymous')

    const safeName =
      rawName.length > 18
        ? rawName.slice(0, 18) + '…'
        : rawName

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 🌌 Deep cinematic background
    const bg = ctx.createLinearGradient(0, 0, 0, height)

    bg.addColorStop(0, '#010203')
    bg.addColorStop(1, '#06080f')

    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // subtle orange nebula
    const nebula = ctx.createRadialGradient(
      width * 0.7,
      height * 0.4,
      100,
      width * 0.7,
      height * 0.4,
      700
    )

    nebula.addColorStop(0, 'rgba(255,120,60,0.08)')
    nebula.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = nebula
    ctx.fillRect(0, 0, width, height)

    // 🌠 Star streaks
    for (let i = 0; i < 140; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = Math.random() * 1.5

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.random() * 6, y + Math.random() * 2)
      ctx.stroke()
    }

    // ✨ Bright stars
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      const glow = ctx.createRadialGradient(x, y, 0, x, y, 6)

      glow.addColorStop(0, 'rgba(255,255,255,0.9)')
      glow.addColorStop(1, 'rgba(255,255,255,0)')

      ctx.fillStyle = glow

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }

    // 🌍 Mars
    const mars = await loadImage(
      'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
    )

    const cx = width * 0.65
    const cy = height / 2
    const r = 210

    // atmosphere glow
    const atmosphere = ctx.createRadialGradient(
      cx,
      cy,
      r,
      cx,
      cy,
      r + 70
    )

    atmosphere.addColorStop(0, 'rgba(255,120,60,0.25)')
    atmosphere.addColorStop(1, 'rgba(255,120,60,0)')

    ctx.fillStyle = atmosphere

    ctx.beginPath()
    ctx.arc(cx, cy, r + 60, 0, Math.PI * 2)
    ctx.fill()

    // draw Mars
    ctx.save()

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()

    ctx.drawImage(
      mars,
      cx - r,
      cy - r,
      r * 2,
      r * 2
    )

    ctx.restore()

    // 🌑 Shadow
    const shadow = ctx.createRadialGradient(
      cx + 120,
      cy + 60,
      60,
      cx,
      cy,
      r
    )

    shadow.addColorStop(0, 'rgba(0,0,0,0)')
    shadow.addColorStop(1, 'rgba(0,0,0,0.9)')

    ctx.fillStyle = shadow

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // 🌀 Orbit ring
    ctx.strokeStyle = 'rgba(255,120,60,0.3)'
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.ellipse(
      cx,
      cy,
      r + 25,
      r * 0.6,
      -0.3,
      0,
      Math.PI * 2
    )

    ctx.stroke()

    // 🔴 Impact dot
    const dotX = cx + 120
    const dotY = cy - 50

    const dotGlow = ctx.createRadialGradient(
      dotX,
      dotY,
      0,
      dotX,
      dotY,
      50
    )

    dotGlow.addColorStop(0, '#ff5a3c')
    dotGlow.addColorStop(1, 'rgba(255,90,60,0)')

    ctx.fillStyle = dotGlow

    ctx.beginPath()
    ctx.arc(dotX, dotY, 50, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'

    ctx.beginPath()
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
    ctx.fill()

    // 🧠 LEFT CONTENT
    ctx.textAlign = 'left'

    // username (only if custom name entered)
    if (safeName !== 'Anonymous') {
      ctx.fillStyle = '#888'
      ctx.font = 'normal 22px Inter'
      ctx.fillText(`@${safeName}`, 80, 130)
    }

    // title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 66px Inter'

    if (safeName === 'Anonymous') {
      ctx.fillText('Your mark is now', 80, 210)
      ctx.fillText('on Mars.', 80, 290)
    } else {
      ctx.fillText(`${safeName} planted`, 80, 210)
      ctx.fillText('on Mars.', 80, 290)
    }

    // accent line
    ctx.fillStyle = '#ff5a3c'
    ctx.fillRect(80, 320, 70, 4)

    // coordinates
    ctx.font = 'normal 26px Inter'
    ctx.fillStyle = '#9aa0a6'

    ctx.fillText(
      `${parseFloat(lat).toFixed(2)}°N · ${parseFloat(lng).toFixed(2)}°W`,
      80,
      370
    )

    // badge
    ctx.fillStyle = 'rgba(255,255,255,0.08)'

    ctx.beginPath()
    ctx.roundRect(80, 400, 240, 42, 12)
    ctx.fill()

    ctx.fillStyle = '#ddd'
    ctx.font = 'normal 18px Inter'
    ctx.fillText('First footprint logged', 95, 427)

    // dot id
    const safeId =
      String(id).length > 14
        ? String(id).slice(0, 14) + '…'
        : String(id)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#666'
    ctx.font = 'normal 18px Inter'

    ctx.fillText(`Dot #${safeId}`, width - 60, 60)

    // brand
    ctx.textAlign = 'left'
    ctx.fillStyle = '#333'
    ctx.fillText('reddotmars', 80, height - 40)

    // ⚡ Output
    const buffer = canvas.toBuffer('image/png')

    res.setHeader('Content-Type', 'image/png')
    res.setHeader(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
    res.setHeader('Content-Length', buffer.length)

    res.status(200).end(buffer)
  } catch (err) {
    console.error('OG ERROR:', err)

    res.status(500).send('OG failed')
  }
}