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

    // 🌌 CINEMATIC BACKGROUND
    const bg = ctx.createLinearGradient(0, 0, 0, height)
    bg.addColorStop(0, '#010203')
    bg.addColorStop(1, '#06080f')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // light falloff
    const falloff = ctx.createRadialGradient(
      width * 0.7,
      height * 0.4,
      100,
      width * 0.7,
      height * 0.4,
      700
    )
    falloff.addColorStop(0, 'rgba(255,120,60,0.08)')
    falloff.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = falloff
    ctx.fillRect(0, 0, width, height)

    // ✨ STARS (cinematic drift feel)
    for (let i = 0; i < 140; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.beginPath()
      ctx.ellipse(x, y, 1.2, 0.6, 0.2, 0, Math.PI * 2) // stretched = motion feel
      ctx.fill()
    }

    // bright stars
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width
      const y = Math.random() * height

      const glow = ctx.createRadialGradient(x, y, 0, x, y, 5)
      glow.addColorStop(0, 'rgba(255,255,255,0.9)')
      glow.addColorStop(1, 'rgba(255,255,255,0)')

      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }

    // 🌍 Mars (shifted right)
    const mars = await loadImage(
      'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
    )

    const cx = width * 0.65
    const cy = height / 2
    const r = 210

    // atmosphere
    const atmosphere = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 60)
    atmosphere.addColorStop(0, 'rgba(255,120,60,0.2)')
    atmosphere.addColorStop(1, 'rgba(255,120,60,0)')
    ctx.fillStyle = atmosphere
    ctx.beginPath()
    ctx.arc(cx, cy, r + 50, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(mars, cx - r, cy - r, r * 2, r * 2)
    ctx.restore()

    // shadow
    const shadow = ctx.createRadialGradient(cx + 100, cy + 40, 50, cx, cy, r)
    shadow.addColorStop(0, 'rgba(0,0,0,0)')
    shadow.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = shadow
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // rim light
    ctx.strokeStyle = 'rgba(255,120,60,0.35)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(cx, cy, r + 1, -0.5, 2.8)
    ctx.stroke()

    // 🔴 Dot
    const dotX = cx + 120
    const dotY = cy - 40

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 40)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 40, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2)
    ctx.fill()

    // 🧠 TEXT (left)
    ctx.textAlign = 'left'

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 64px Inter'
    ctx.fillText('I planted', 80, 200)
    ctx.fillText('on Mars.', 80, 270)

    ctx.fillStyle = '#ff5a3c'
    ctx.fillRect(80, 300, 60, 4)

    ctx.font = 'normal 26px Inter'
    ctx.fillStyle = '#9aa0a6'
    ctx.fillText(`${lat}°N · ${lng}°W`, 80, 350)

    // 🔥 FIXED DOT ID (top-right, safe)
    const safeId = id.length > 12 ? id.slice(0, 12) + '…' : id

    ctx.textAlign = 'right'
    ctx.font = 'normal 18px Inter'
    ctx.fillStyle = '#666'
    ctx.fillText(`Dot #${safeId}`, width - 60, 60)

    // brand
    ctx.textAlign = 'left'
    ctx.font = 'normal 18px Inter'
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