import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

export const config = {
  runtime: 'nodejs',
}

// ✅ Fix for __dirname in Vercel
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Correct font paths (based on your structure)
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

    // 🎨 Background
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, width, height)

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

    // 🌍 Mars (reliable external)
    const mars = await loadImage(
      'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
    )

    const cx = width / 2
    const cy = height / 2 - 10
    const r = 200

    // atmosphere glow
    const atmosphere = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 35)
    atmosphere.addColorStop(0, 'rgba(255,120,60,0.12)')
    atmosphere.addColorStop(1, 'rgba(255,120,60,0)')
    ctx.fillStyle = atmosphere
    ctx.beginPath()
    ctx.arc(cx, cy, r + 30, 0, Math.PI * 2)
    ctx.fill()

    // draw Mars
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(mars, cx - r, cy - r, r * 2, r * 2)
    ctx.restore()

    // shadow
    const shadow = ctx.createRadialGradient(cx + 80, cy + 30, 50, cx, cy, r)
    shadow.addColorStop(0, 'rgba(0,0,0,0)')
    shadow.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = shadow
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // highlight
    const highlight = ctx.createRadialGradient(cx - 120, cy - 120, 10, cx, cy, r)
    highlight.addColorStop(0, 'rgba(255,255,255,0.08)')
    highlight.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = highlight
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // 🔴 Dot
    const dotX = cx + 110
    const dotY = cy - 20

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 26)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 26, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
    ctx.fill()

    // 🧠 Typography (Inter only)
    ctx.textAlign = 'center'

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 56px Inter'
    ctx.fillText('I planted on Mars', width / 2, 90)

    ctx.font = 'normal 24px Inter'
    ctx.fillStyle = '#9aa0a6'
    ctx.fillText(`${lat}°N · ${lng}°W`, width / 2, height - 110)

    ctx.font = 'normal 20px Inter'
    ctx.fillStyle = '#666'
    ctx.fillText(`Dot #${id}`, width / 2, height - 70)

    ctx.font = 'normal 18px Inter'
    ctx.fillStyle = '#333'
    ctx.fillText('reddotmars', width / 2, height - 30)

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