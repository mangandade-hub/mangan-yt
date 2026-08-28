const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_API_ORIGIN = 'https://yt-dlp-api-node.mangandenti.com';

app.use(cors({ origin: '*' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(204).end();
  }

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const proxyOrigin = `${protocol}://${req.headers.host}`;
  const targetUrl = new URL(req.url, TARGET_API_ORIGIN).toString();

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Host': new URL(TARGET_API_ORIGIN).hostname,
        'User-Agent': req.headers['user-agent'] || '',
      },
    });

    const contentType = (fetchResponse.headers.get('content-type') || '').toLowerCase();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', contentType);

    const isTextOrScript =
      contentType.includes('text/') ||
      contentType.includes('javascript') ||
      contentType.includes('json');

    if (isTextOrScript) {
      let text = await fetchResponse.text();

      text = text
        .replaceAll(TARGET_API_ORIGIN, proxyOrigin)
        .replaceAll(TARGET_API_ORIGIN.replace("https://", "http://"), proxyOrigin);

      const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\:[0-9]+)?/g;
      text = text.replace(urlRegex, (match) => {
        try {
          const extUrl = new URL(match);
          if (extUrl.hostname === req.headers.host) return match;
          if (extUrl.hostname.includes("mangandenti.com")) return proxyOrigin;
          return match;
        } catch (e) {
          return match;
        }
      });

      const escapedProxyOrigin = proxyOrigin.replaceAll("/", "\\/");
      text = text.replace(/https?:\\\/\\\/([^\\\/"]+)/g, (match, host) => {
        if (host.includes("mangandenti.com") || host === req.headers.host) {
          return escapedProxyOrigin;
        }
        return match;
      });

      return res.status(fetchResponse.status).send(text);
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    return res.status(fetchResponse.status).send(Buffer.from(arrayBuffer));

  } catch (e) {
    return res.status(502).json({ error: "Proxy Error: " + e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
