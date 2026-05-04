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

    // 🌌 Background (dark blue)
    ctx.fillStyle = '#0b1b2b'
    ctx.fillRect(0, 0, width, height)

    // ⭐ stars
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.beginPath()
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    // 🌍 Mars (LEFT SIDE BIG)
    let mars
    try {
      mars = await loadImage(path.join(__dirname, 'textures/mars.jpg'))
    } catch {
      mars = await loadImage(
        'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg'
      )
    }

    const marsX = 250
    const marsY = height / 2
    const marsR = 200

    ctx.save()
    ctx.beginPath()
    ctx.arc(marsX, marsY, marsR, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(
      mars,
      marsX - marsR,
      marsY - marsR,
      marsR * 2,
      marsR * 2
    )
    ctx.restore()

    // 🔴 dot
    const dotX = marsX + 120
    const dotY = marsY - 40

    const glow = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 25)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')

    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(dotX, dotY, 25, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2)
    ctx.fill()

    // 🚀 RIGHT SIDE CONTENT

    const rightX = 520

    // SOL badge
    ctx.fillStyle = '#2a3b2a'
    ctx.beginPath()
    ctx.roundRect(rightX, 60, 140, 40, 20)
    ctx.fill()

    ctx.fillStyle = '#ffe66d'
    ctx.font = 'bold 20px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('SOL 505', rightX + 70, 88)

    // TITLE
    ctx.textAlign = 'left'

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px Inter'
    ctx.fillText('Dot planted', rightX, 160)

    ctx.fillStyle = '#ff5a3c'
    ctx.fillText('on Mars!', rightX, 230)

    // coordinates pill
    ctx.fillStyle = '#1e2a38'
    ctx.beginPath()
    ctx.roundRect(rightX, 270, 420, 50, 12)
    ctx.fill()

    ctx.fillStyle = '#d0d7de'
    ctx.font = '22px Inter'
    ctx.fillText(`${lat}°N ${lng}°W · near open terrain`, rightX + 20, 305)

    // divider
    ctx.strokeStyle = '#334'
    ctx.beginPath()
    ctx.moveTo(rightX, 340)
    ctx.lineTo(rightX + 420, 340)
    ctx.stroke()

    // tagline
    ctx.fillStyle = '#9aa4af'
    ctx.font = '22px Inter'
    ctx.fillText('One planet. Eight billion dots.', rightX, 380)

    // hashtags
    ctx.fillStyle = '#ff5a3c'
    ctx.fillText('#SolMars #Mars', rightX, 420)

    // brand
    ctx.fillStyle = '#556'
    ctx.font = '18px Inter'
    ctx.fillText('reddotmars.vercel.app', rightX, 460)

    // ⚡ OUTPUT
    const buffer = canvas.toBuffer('image/png')

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Length', buffer.length)

    return res.status(200).end(buffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('OG failed')
  }
}