import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'
import { fileURLToPath } from 'url'

export const config = {
  runtime: 'nodejs',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

    // 🌌 Background
    ctx.fillStyle = '#0d1b2a'
    ctx.fillRect(0, 0, width, height)

    // ⭐ Stars
    const starPositions = [
      [60, 50], [150, 110], [100, 190], [36, 290],
      [1210, 44], [1304, 136], [1250, 236], [1326, 310],
      [676, 24], [796, 56], [1004, 36], [296, 36],
      [890, 680], [640, 696],
    ]
    starPositions.forEach(([x, y]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.arc(x / 2, y / 2, 1.5, 0, Math.PI * 2)
      ctx.fill()
    })

    // ✨ Cartoon star shapes
    const drawStar = (x, y, size, color, opacity) => {
      ctx.save()
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const r = i % 2 === 0 ? size : size * 0.4
        ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    drawStar(1100, 530, 14, '#ffd700', 0.9)
    drawStar(80, 490, 10, '#ffd700', 0.7)
    drawStar(1020, 570, 8, '#ffd700', 0.6)

    // 🟠 MARS SETUP
    const cx = 260
    const cy = height / 2
    const r = 190

    // Outer glow
    const marsGlow = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.2)
    marsGlow.addColorStop(0, 'rgba(255,90,26,0.12)')
    marsGlow.addColorStop(1, 'rgba(255,90,26,0)')
    ctx.fillStyle = marsGlow
    ctx.beginPath()
    ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2)
    ctx.fill()

    // Cartoon thick outline
    ctx.fillStyle = '#7a1e00'
    ctx.beginPath()
    ctx.arc(cx, cy, r + 7, 0, Math.PI * 2)
    ctx.fill()

    // Main planet gradient
    const marsGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r)
    marsGrad.addColorStop(0, '#f0622a')
    marsGrad.addColorStop(0.6, '#d94f1e')
    marsGrad.addColorStop(1, '#8a2500')
    ctx.fillStyle = marsGrad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()

    // Clip everything to planet
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()

    // Surface band
    ctx.fillStyle = 'rgba(201,66,24,0.45)'
    ctx.beginPath()
    ctx.ellipse(cx, cy - 20, r, 25, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(232,96,48,0.3)'
    ctx.beginPath()
    ctx.ellipse(cx, cy + 25, r, 16, 0, 0, Math.PI * 2)
    ctx.fill()

    // Polar ice cap
    ctx.fillStyle = 'rgba(245,217,200,0.6)'
    ctx.beginPath()
    ctx.ellipse(cx, cy - r + 20, 65, 22, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath()
    ctx.ellipse(cx, cy - r + 16, 48, 14, 0, 0, Math.PI * 2)
    ctx.fill()

    // Big crater left
    const drawCrater = (x, y, outerR, innerR) => {
      const g = ctx.createRadialGradient(x - outerR * 0.3, y - outerR * 0.3, 0, x, y, outerR)
      g.addColorStop(0, '#c94218')
      g.addColorStop(1, '#8a2500')
      ctx.strokeStyle = '#7a2000'
      ctx.lineWidth = 4
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, outerR, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = 'rgba(184,53,16,0.5)'
      ctx.beginPath()
      ctx.arc(x, y, innerR, 0, Math.PI * 2)
      ctx.fill()
    }
    drawCrater(cx - 95, cy - 10, 35, 24)
    drawCrater(cx + 80, cy + 60, 22, 14)
    drawCrater(cx + 55, cy - 55, 15, 9)

    // Small craters
    ;[[cx - 20, cy + 70, 9], [cx + 20, cy + 88, 6], [cx - 55, cy - 70, 8]].forEach(([x, y, rad]) => {
      ctx.fillStyle = '#b03010'
      ctx.strokeStyle = '#7a2000'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, rad, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })

    // Canyon lines
    ctx.strokeStyle = 'rgba(160,48,16,0.5)'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - r + 10, cy - 5)
    ctx.bezierCurveTo(cx - 50, cy - 15, cx + 50, cy + 10, cx + r - 10, cy - 8)
    ctx.stroke()
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.35
    ctx.beginPath()
    ctx.moveTo(cx - r + 20, cy + 22)
    ctx.bezierCurveTo(cx - 40, cy + 12, cx + 40, cy + 28, cx + r - 20, cy + 18)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Highlight sheen
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.beginPath()
    ctx.ellipse(cx - r * 0.3, cy - r * 0.3, r * 0.45, r * 0.3, -0.4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore() // end clip

    // ===== FACE =====
    // Eyebrows
    ctx.strokeStyle = '#7a2000'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx - 85, cy - 68)
    ctx.quadraticCurveTo(cx - 65, cy - 78, cx - 45, cy - 70)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx + 45, cy - 70)
    ctx.quadraticCurveTo(cx + 65, cy - 78, cx + 85, cy - 68)
    ctx.stroke()

    // Eyes white
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#7a2000'
    ctx.lineWidth = 3
    ;[[cx - 65, cy - 48], [cx + 65, cy - 48]].forEach(([ex, ey]) => {
      ctx.beginPath()
      ctx.arc(ex, ey, 26, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })

    // Pupils
    ctx.fillStyle = '#1a0800'
    ;[[cx - 61, cy - 45], [cx + 69, cy - 45]].forEach(([px, py]) => {
      ctx.beginPath()
      ctx.arc(px, py, 14, 0, Math.PI * 2)
      ctx.fill()
    })

    // Eye shine
    ctx.fillStyle = '#fff'
    ;[[cx - 55, cy - 52], [cx + 75, cy - 52]].forEach(([sx, sy]) => {
      ctx.beginPath()
      ctx.arc(sx, sy, 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sx + 8, sy + 8, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Rosy cheeks
    ctx.fillStyle = 'rgba(255,100,68,0.45)'
    ctx.beginPath()
    ctx.ellipse(cx - 110, cy + 20, 30, 18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(cx + 110, cy + 20, 30, 18, 0, 0, Math.PI * 2)
    ctx.fill()

    // ===== HANDS =====
    const drawHand = (hx, hy) => {
      ctx.fillStyle = '#d94f1e'
      ctx.strokeStyle = '#7a2000'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.ellipse(hx, hy, 28, 18, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ;[[-14, 10], [0, 16], [14, 12]].forEach(([dx, dy]) => {
        ctx.beginPath()
        ctx.arc(hx + dx, hy + dy, 13, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      })
    }
    drawHand(cx - 165, cy + 80)
    drawHand(cx + 165, cy + 80)

    // ===== SIGN =====
    const signX = cx - 110
    const signY = cy + 105
    const signW = 220
    const signH = 95

    ctx.fillStyle = '#5a3a10'
    ctx.beginPath()
    ctx.roundRect(signX + 4, signY + 4, signW, signH, 14)
    ctx.fill()

    ctx.fillStyle = '#8a6a30'
    ctx.strokeStyle = '#5a3a10'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.roundRect(signX, signY, signW, signH, 14)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#dbbf80'
    ctx.strokeStyle = '#8a6a30'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(signX + 6, signY + 6, signW - 12, signH - 12, 10)
    ctx.fill()
    ctx.stroke()

    // Sign text
    ctx.textAlign = 'center'
    ctx.fillStyle = '#5a3000'
    ctx.font = 'bold 26px Inter'
    ctx.fillText('I PLANTED', cx, signY + 42)
    ctx.fillStyle = '#c13e10'
    ctx.fillText('ON MARS!', cx, signY + 74)

    // ===== ROCKET =====
    const rx = cx - 200
    const ry = cy - 155

    // Flame
    ctx.fillStyle = 'rgba(255,215,0,0.85)'
    ctx.beginPath()
    ctx.ellipse(rx, ry + 95, 13, 20, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff8c00'
    ctx.beginPath()
    ctx.ellipse(rx, ry + 100, 9, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ff5a3c'
    ctx.beginPath()
    ctx.ellipse(rx, ry + 104, 5, 8, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body
    ctx.fillStyle = '#eeeef8'
    ctx.strokeStyle = '#aaaacc'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(rx - 16, ry + 20, 32, 70, 8)
    ctx.fill()
    ctx.stroke()

    // Nose
    ctx.fillStyle = '#ff5a3c'
    ctx.strokeStyle = '#cc3010'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(rx - 16, ry + 22)
    ctx.quadraticCurveTo(rx, ry - 15, rx + 16, ry + 22)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Stripe
    ctx.fillStyle = 'rgba(255,90,60,0.4)'
    ctx.beginPath()
    ctx.rect(rx - 16, ry + 62, 32, 10)
    ctx.fill()

    // Window
    ctx.fillStyle = '#7ec8e3'
    ctx.strokeStyle = '#8888aa'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(rx, ry + 38, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.beginPath()
    ctx.arc(rx + 3, ry + 35, 4, 0, Math.PI * 2)
    ctx.fill()

    // Wings
    ctx.fillStyle = '#ff5a3c'
    ctx.strokeStyle = '#cc3010'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(rx - 16, ry + 72)
    ctx.lineTo(rx - 36, ry + 90)
    ctx.lineTo(rx - 16, ry + 82)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rx + 16, ry + 72)
    ctx.lineTo(rx + 36, ry + 90)
    ctx.lineTo(rx + 16, ry + 82)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // ===== RIGHT SIDE UI =====
    const rightX = 520

    // Sol badge
    ctx.fillStyle = 'rgba(255,215,0,0.12)'
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(rightX, 55, 130, 36, 18)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#ffd700'
    ctx.font = 'bold 18px Inter'
    ctx.textAlign = 'center'
    ctx.fillText('SOL 505', rightX + 65, 79)

    // Headline
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 72px Inter'
    ctx.fillText('Dot planted', rightX, 175)
    ctx.fillStyle = '#ff5a3c'
    ctx.fillText('on Mars!', rightX, 255)

    // Coords box
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(rightX, 278, 430, 52, 12)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#9aa4af'
    ctx.font = '22px Inter'
    ctx.fillText(`${lat}°N  ${lng}°W · near open terrain`, rightX + 16, 312)

    // Divider
    ctx.strokeStyle = 'rgba(255,90,60,0.25)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(rightX, 350)
    ctx.lineTo(rightX + 430, 350)
    ctx.stroke()

    // Tagline
    ctx.fillStyle = '#666e78'
    ctx.font = '22px Inter'
    ctx.fillText('One planet. Eight billion dots.', rightX, 392)

    // Hashtags
    ctx.fillStyle = '#ff5a3c'
    ctx.font = 'bold 22px Inter'
    ctx.fillText('#SolMars  #Mars', rightX, 432)

    // URL
    ctx.fillStyle = '#3a4450'
    ctx.font = '18px Inter'
    ctx.fillText('reddotmars.vercel.app', rightX, 472)

    // Red dot accent
    ctx.fillStyle = '#ff5a3c'
    ctx.strokeStyle = '#cc3010'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(1140, 580, 14, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(1140, 580, 5, 0, Math.PI * 2)
    ctx.fill()

    // Output
    const buffer = canvas.toBuffer('image/png')
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Length', buffer.length)
    res.status(200).end(buffer)

  } catch (err) {
    console.error('OG ERROR:', err)
    res.status(500).send('OG failed')
  }
}