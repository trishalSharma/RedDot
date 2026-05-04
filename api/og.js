import { createCanvas, loadImage } from 'canvas'
import path from 'path'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  try {
    const { id = '123' } = req.query

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // ⚡ FAST background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    // ⚡ Load Mars image (with fallback)
    let mars
    try {
      const imgPath = path.join(
        process.cwd(),
        'sol/public/textures/mars.jpg'
      )
      mars = await loadImage(imgPath)
    } catch (e) {
      // fallback (never fail OG)
      mars = await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
      )
    }

    // ⚡ Draw Mars safely
    const cx = width / 2
    const cy = height / 2
    const radius = 150

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(mars, cx - radius, cy - radius, radius * 2, radius * 2)
    ctx.restore()

    // ⚡ Glow dot (lightweight)
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

    // ⚡ Text (NO custom font → fast + reliable)
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'

    ctx.font = 'bold 56px sans-serif'
    ctx.fillText('I planted on Mars 🚀', width / 2, 100)

    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`Dot #${id}`, width / 2, height - 60)

    // ⚡ Convert to buffer
    const buffer = canvas.toBuffer('image/png')

    // ⚡ Headers (VERY IMPORTANT for bots)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    )
    res.setHeader('Content-Length', buffer.length)

    return res.status(200).end(buffer)
  } catch (err) {
    console.error('OG ERROR:', err)

    // ⚡ Always return something (never fail)
    res.setHeader('Content-Type', 'text/plain')
    return res.status(200).end('OG fallback')
  }
}