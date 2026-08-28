const fs = require('fs');
const path = require('path');

const TARGET_API_ORIGIN = 'https://yt-dlp-api-node.mangandenti.com';

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(204).end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    try {
      const htmlPath = path.join(process.cwd(), 'index.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(htmlContent);
    } catch (e) {
      return res.status(500).send('Error loading index.html');
    }
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
};
