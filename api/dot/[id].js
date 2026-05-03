export default function handler(req, res) {
  const { id } = req.query;

  const APP_URL = `https://${req.headers.host}`;
  const ogImageUrl = `${APP_URL}/api/og?id=${id}`;

  res.setHeader("Content-Type", "text/html");

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>SolMars 🚀</title>

        <meta property="og:title" content="I planted on Mars 🚀" />
        <meta property="og:description" content="Join me in terraforming Mars" />
        <meta property="og:image" content="${ogImageUrl}" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="${APP_URL}/dot/${id}" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="I planted on Mars 🚀" />
        <meta name="twitter:description" content="Join me in terraforming Mars" />
        <meta name="twitter:image" content="${ogImageUrl}" />

        <meta http-equiv="refresh" content="0; url=/?dot=${id}" />
      </head>
      <body></body>
    </html>
  `);
}