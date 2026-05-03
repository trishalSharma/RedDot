import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

// register font
const fontPath = path.join(process.cwd(), 'sol/public/fonts/Inter-Bold.ttf')
registerFont(fontPath, { family: 'Inter' })

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)

    const id = url.searchParams.get('id') || '123'
    const lat = parseFloat(url.searchParams.get('lat')) || 22
    const lng = parseFloat(url.searchParams.get('lng')) || 77

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // 🌌 background
    const bg = ctx.createLinearGradient(0, 0, 0, height)
    bg.addColorStop(0, '#020202')
    bg.addColorStop(1, '#0b0b0b')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, width, height)

    // vignette
    const vignette = ctx.createRadialGradient(width/2, height/2, 200, width/2, height/2, 700)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, width, height)

    // 🌍 load mars from PUBLIC URL (important)
    let mars
    try {
      mars = await loadImage(`https://${req.headers.host}/textures/mars.jpg`)
    } catch {
      mars = null
    }

    const cx = width / 2
    const cy = height / 2 - 20
    const radius = 160

    // draw planet
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()

    if (mars) {
      ctx.drawImage(mars, cx - radius, cy - radius, radius * 2, radius * 2)
    } else {
      ctx.fillStyle = '#a0522d'
      ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
    }

    ctx.restore()

    // shadow
    const dark = ctx.createRadialGradient(cx + 60, cy + 20, 50, cx, cy, radius)
    dark.addColorStop(0, 'rgba(0,0,0,0)')
    dark.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = dark
    ctx.fill()

    // highlight
    const highlight = ctx.createRadialGradient(cx - 80, cy - 80, 20, cx, cy, radius)
    highlight.addColorStop(0, 'rgba(255,255,255,0.08)')
    highlight.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.fillStyle = highlight
    ctx.fill()

    // 📍 location
    const radLat = lat * Math.PI / 180
    const radLng = lng * Math.PI / 180

    const x = cx + radius * Math.cos(radLat) * Math.sin(radLng)
    const y = cy - radius * Math.sin(radLat)

    const glow = ctx.createRadialGradient(x, y, 0, x, y, 25)
    glow.addColorStop(0, '#ff5a3c')
    glow.addColorStop(1, 'rgba(255,90,60,0)')
    ctx.beginPath()
    ctx.arc(x, y, 25, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()

    // ✨ text
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'

    ctx.font = 'bold 56px Inter, Arial'
    ctx.fillText('I planted on Mars', width / 2, 100)

    ctx.font = 'bold 28px Inter, Arial'
    ctx.fillStyle = '#bbbbbb'
    ctx.fillText(`${lat.toFixed(2)}°, ${lng.toFixed(2)}°`, width / 2, height - 100)

    ctx.font = 'bold 26px Inter, Arial'
    ctx.fillStyle = '#888'
    ctx.fillText(`Dot #${id}`, width / 2, height - 60)

    ctx.font = 'bold 20px Inter, Arial'
    ctx.fillStyle = '#444'
    ctx.fillText('reddotmars', width / 2, height - 20)

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