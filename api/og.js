import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

export const config = {
  runtime: 'nodejs',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// fonts
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
    const { id = '123', lat = '15.53', lng = '99.47' } = req.query

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 🌌 DEEP SPACE
    const bg = ctx.createLinearGradient(0, 0, 0, height)
    bg.addColorStop(0, '#010203')
    bg.addColorStop(1, '#06080f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // 🌠 STAR STREAKS (motion illusion)
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = Math.random() * 1.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.random() * 6, y + Math.random() * 2)
      ctx.stroke()
    }

    // ✨ BRIGHT STARS
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

    // 🌫️ atmosphere glow
    const atmosphere = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 70)
    atmosphere.addColorStop(0, 'rgba(255,120,60,0.25)')
    atmosphere.addColorStop(1, 'rgba(255,120,60,0)')
    ctx.fillStyle = atmosphere
    ctx.beginPath()
    ctx.arc(cx, cy, r + 60, 0, Math.PI * 2)
    ctx.fill()

    // 🌍 draw Mars
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(mars, cx - r, cy - r, r * 2, r * 2)
    ctx.restore()

    // 🌑 shadow
    const shadow = ctx.createRadialGradient(cx + 120, cy + 60, 60, cx, cy, r)
    shadow.addColorStop(0, 'rgba(0,0,0,0)')
    shadow.addColorStop(1, 'rgba(0,0,0,0.9)')
    ctx.fillStyle = shadow
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // 🌀 ORBIT RING (viral visual hook)
    ctx.strokeStyle = 'rgba(255,120,60,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(cx, cy, r + 25, r * 0.6, -0.3, 0, Math.PI * 2)
    ctx.stroke()

    // 🔴 IMPACT DOT (pulse style)
    const dotX = cx + 120
    const dotY = cy - 50

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 50)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 50, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2)
    ctx.fill()

    // 🧠 TEXT
    ctx.textAlign = 'left'

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 66px Inter'
    ctx.fillText('Your mark is now', 80, 190)
    ctx.fillText('on Mars.', 80, 270)

    ctx.fillStyle = '#ff5a3c'
    ctx.fillRect(80, 300, 70, 4)

    ctx.font = 'normal 26px Inter'
    ctx.fillStyle = '#9aa0a6'
    ctx.fillText(`${lat}°N · ${lng}°W`, 80, 350)

    // 🏷 badge (product feel)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.roundRect(80, 380, 200, 40, 12)
    ctx.fill()

    ctx.fillStyle = '#ddd'
    ctx.font = 'normal 18px Inter'
    ctx.fillText('First footprint logged', 95, 407)

    // 🔢 safe ID (top-right)
    const safeId = id.length > 12 ? id.slice(0, 12) + '…' : id

    ctx.textAlign = 'right'
    ctx.fillStyle = '#666'
    ctx.fillText(`Dot #${safeId}`, width - 60, 60)

    // brand
    ctx.textAlign = 'left'
    ctx.fillStyle = '#333'
    ctx.fillText('reddotmars', 80, height - 40)

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