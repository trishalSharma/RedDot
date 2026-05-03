import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default function handler(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || '123'
  const lat = searchParams.get('lat') || '22.00'
  const lng = searchParams.get('lng') || '77.00'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          fontSize: 48,
        }}
      >
        <img
          src={`https://${req.headers.get('host')}/textures/mars.jpg`}
          width="300"
          height="300"
          style={{
            borderRadius: '50%',
            marginBottom: 40,
          }}
        />

        <div>I planted on Mars 🚀</div>

        <div style={{ fontSize: 28, opacity: 0.7 }}>
          {lat}°, {lng}°
        </div>

        <div style={{ fontSize: 24, opacity: 0.5 }}>
          Dot #{id}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}