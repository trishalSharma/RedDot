export default function handler(req, res) {
  const { id } = req.query

  const APP_URL = `https://${req.headers.host}`
  const ogImage = `${APP_URL}/api/og?id=${id}`

  res.setHeader('Content-Type', 'text/html')

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>SolMars 🚀</title>

        <meta property="og:title" content="I planted on Mars 🚀" />
        <meta property="og:description" content="Join me in terraforming Mars" />
        <meta property="og:image" content="${ogImage}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${APP_URL}/dot/${id}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="${ogImage}" />
        <meta name="twitter:title" content="I planted on Mars 🚀" />
        <meta name="twitter:description" content="Join me in terraforming Mars" />
      </head>

      <body style="background:black;color:white;display:flex;align-items:center;justify-content:center;height:100vh;">
        Loading Mars...
        <script>
          setTimeout(() => { window.location.href = '/?dot=${id}' }, 100)
        </script>
      </body>
    </html>
  `)
}