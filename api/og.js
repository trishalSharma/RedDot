import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

export const config = {
  runtime: 'nodejs',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ✅ Points to api/fonts/Inter-Bold.ttf
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
    const { id = '123' } = req.query

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // ⚡ Background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    // ⚡ Load Mars image (safe fallback)
    let mars
    try {
      // ✅ Points to api/textures/mars.jpg
      const imgPath = path.join(__dirname, 'textures/mars.jpg')
      mars = await loadImage(imgPath)
    } catch {
      mars = await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
      )
    }

    // ⚡ Draw Mars
    const cx = width / 2
    const cy = height / 2
    const radius = 150

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(mars, cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.restore()

    // 🔴 Glow dot
    const dotX = cx + 80
    const dotY = cy - 20

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 20)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')

    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 3, 0, Math.PI * 2)
    ctx.fill()

    // ⚡ TEXT
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'

    ctx.font = 'bold 56px Inter'
    ctx.fillText('I planted on Mars', width / 2, 100)

    ctx.font = '24px Inter'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`Dot #${id}`, width / 2, height - 60)

    // ⚡ Buffer
    const buffer = canvas.toBuffer('image/png')

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Length', buffer.length)

    return res.status(200).end(buffer)
  } catch (err) {
    console.error('OG ERROR:', err)

    res.setHeader('Content-Type', 'text/plain')
    return res.status(200).end('OG fallback')
  }
}