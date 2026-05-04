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

    // 🌌 background
    ctx.fillStyle = '#0b1b2b'
    ctx.fillRect(0, 0, width, height)

    // stars
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // 🟠 CARTOON MARS
    const cx = 260
    const cy = height / 2
    const r = 190

    // main circle
    ctx.fillStyle = '#e24b1a'
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // darker patches
    ctx.fillStyle = '#c43c13'
    ctx.beginPath()
    ctx.ellipse(cx - 40, cy - 40, 60, 30, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(cx + 40, cy + 20, 50, 25, 0, 0, Math.PI * 2)
    ctx.fill()

    // cheeks
    ctx.fillStyle = '#ff7a4d'
    ctx.beginPath()
    ctx.arc(cx - 60, cy + 20, 18, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx + 60, cy + 20, 18, 0, Math.PI * 2)
    ctx.fill()

    // eyes
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(cx - 50, cy - 30, 22, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx + 50, cy - 30, 22, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.arc(cx - 50, cy - 30, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx + 50, cy - 30, 10, 0, Math.PI * 2)
    ctx.fill()

    // smile
    ctx.strokeStyle = '#5a1a0d'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(cx, cy + 10, 60, 0.2, Math.PI - 0.2)
    ctx.stroke()

    // 🔴 glowing dot
    const dotX = cx + 120
    const dotY = cy - 20

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 30)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 30, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2)
    ctx.fill()

    // 🧠 RIGHT SIDE UI
    const rightX = 520

    ctx.fillStyle = '#2a3b2a'
    ctx.beginPath()
    ctx.roundRect(rightX, 60, 140, 40, 20)
    ctx.fill()

    ctx.fillStyle = '#ffe66d'
    ctx.font = 'bold 20px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('SOL 505', rightX + 70, 88)

    ctx.textAlign = 'left'

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px Inter'
    ctx.fillText('Dot planted', rightX, 160)

    ctx.fillStyle = '#ff5a3c'
    ctx.fillText('on Mars!', rightX, 230)

    ctx.fillStyle = '#1e2a38'
    ctx.beginPath()
    ctx.roundRect(rightX, 270, 420, 50, 12)
    ctx.fill()

    ctx.fillStyle = '#d0d7de'
    ctx.font = '22px Inter'
    ctx.fillText(`${lat}°N ${lng}°W · near open terrain`, rightX + 20, 305)

    ctx.fillStyle = '#9aa4af'
    ctx.fillText('One planet. Eight billion dots.', rightX, 380)

    ctx.fillStyle = '#ff5a3c'
    ctx.fillText('#SolMars #Mars', rightX, 420)

    ctx.fillStyle = '#556'
    ctx.font = '18px Inter'
    ctx.fillText('reddotmars.vercel.app', rightX, 460)

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