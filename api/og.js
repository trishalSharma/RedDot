import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

export const config = {
  runtime: 'nodejs',
}

// font
const fontPath = path.join(process.cwd(), 'sol/public/fonts/Inter-Bold.ttf')
registerFont(fontPath, { family: 'Inter' })

export default async function handler(req, res) {
  try {
    const { id = '123' } = req.query

    const width = 1200
    const height = 630

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // background
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)

    // load LOCAL image (IMPORTANT)
    const imgPath = path.join(process.cwd(), 'sol/public/textures/mars.jpg')
    const mars = await loadImage(imgPath)

    // draw mars
    ctx.beginPath()
    ctx.arc(width / 2, height / 2, 150, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(mars, width / 2 - 150, height / 2 - 150, 300, 300)

    // reset clip
    ctx.restore()

    // text
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'

    ctx.font = 'bold 60px Inter'
    ctx.fillText('I planted on Mars 🚀', width / 2, 100)

    ctx.font = 'bold 28px Inter'
    ctx.fillText(`Dot #${id}`, width / 2, height - 80)

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