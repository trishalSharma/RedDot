export default function handler(req, res) {
  const { id, name, lat, lng } = req.query

  const APP_URL = `https://${req.headers.host}`

  // ✅ Pass all dynamic data to OG
  const params = new URLSearchParams({
    id: id || '123',
    name: name || 'Anonymous',
    lat: lat || '0',
    lng: lng || '0',
    v: Date.now(),
  })

  const ogImageUrl = `${APP_URL}/api/og?${params.toString()}`

  res.setHeader('Content-Type', 'text/html')

  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <title>RedDotMars 🚀</title>

        <!-- Primary Meta -->
        <meta
          name="description"
          content="Plant your mark on Mars."
        />

        <!-- Open Graph -->
        <meta property="og:title" content="Your mark is now on Mars 🚀" />
        <meta
          property="og:description"
          content="Plant your mark on Mars."
        />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${APP_URL}/dot/${id}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Your mark is now on Mars 🚀" />
        <meta
          name="twitter:description"
          content="Plant your mark on Mars."
        />
        <meta name="twitter:image" content="${ogImageUrl}" />

        <!-- Theme -->
        <meta name="theme-color" content="#050505" />

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background: #050505;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Inter, system-ui, sans-serif;
          }

          .wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .spinner {
            width: 42px;
            height: 42px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top: 2px solid #ff5a3c;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .text {
            color: #aaa;
            font-size: 15px;
            letter-spacing: 0.3px;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        </style>
      </head>

      <body>
        <div class="wrapper">
          <div class="spinner"></div>
          <div class="text">Redirecting to Mars...</div>
        </div>

        <script>
          setTimeout(() => {
            window.location.href =
              '/?dot=${id}&name=${encodeURIComponent(name || '')}'
          }, 700)
        </script>
      </body>
    </html>
  `)
}