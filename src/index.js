export default {
  async fetch(request) {
    const workerUrl = new URL(request.url);
    const TARGET_API_ORIGIN = "https://yt-dlp-api-node.mangandenti.com";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    if (workerUrl.pathname === "/" || workerUrl.pathname === "/index.html") {
      const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YouTube Extract Player</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background: #0f0f0f;
      color: #f1f1f1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    h1 { font-size: 1.5rem; margin-bottom: 20px; text-align: center; }
    .search-box {
      display: flex;
      gap: 10px;
      width: 100%;
      max-width: 600px;
      margin-bottom: 20px;
    }
    input[type="text"] {
      flex: 1;
      padding: 12px 16px;
      border-radius: 24px;
      border: 1px solid #333;
      background: #222;
      color: #fff;
      font-size: 1rem;
      outline: none;
    }
    input[type="text"]:focus { border-color: #ff0000; }
    button {
      padding: 12px 24px;
      border-radius: 24px;
      border: none;
      background: #ff0000;
      color: #fff;
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #cc0000; }
    #statusText {
      font-size: 0.9rem;
      color: #aaa;
      margin-bottom: 15px;
      min-height: 1.2em;
    }
    .player-box {
      width: 100%;
      max-width: 800px;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      aspect-ratio: 16 / 9;
    }
    .player-box.shorts { aspect-ratio: 9 / 16; max-width: 360px; }
    video { width: 100%; height: 100%; object-fit: contain; }
    #creatorCredit {
      margin-top: 10px;
      font-size: 0.85rem;
      color: #888;
    }
  </style>
</head>
<body>

  <h1>YouTube 動画抽出プレイヤー</h1>

  <div class="search-box">
    <input type="text" id="ytInput" placeholder="YouTube URL または Video ID を入力 "value="https://www.youtube.com/watch?v=MFwtpM21wWc">
    <button onclick="loadAndPlay()">再生</button>
  </div>

  <div id="statusText"></div>

  <div class="player-box" id="playerBox">
    <video id="videoPlayer" controls></video>
  </div>

  <audio id="audioPlayer" style="display:none;"></audio>
  <div id="creatorCredit"></div>

  <script>
    const video = document.getElementById('videoPlayer');
    const audio = document.getElementById('audioPlayer');
    const playerBox = document.getElementById('playerBox');
    const statusText = document.getElementById('statusText');
    const creatorCredit = document.getElementById('creatorCredit');

    function parseVideoId(input) {
      const str = input.trim();
      if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;
      const match = str.match(/(?:v=|\\/shorts\\/|\\/embed\\/|\\/v\\/|youtu\\.be\\/)([a-zA-Z0-9_-]{11})/);
      return match ? match[1] : str;
    }

    function setupSync() {
      video.onplay = () => audio.play();
      video.onpause = () => audio.pause();
      video.onseeking = () => { audio.currentTime = video.currentTime; };
      video.onratechange = () => { audio.playbackRate = video.playbackRate; };

      audio.onwaiting = () => video.pause();
      audio.onplaying = () => video.play();

      setInterval(() => {
        if (!video.paused && Math.abs(video.currentTime - audio.currentTime) > 0.15) {
          audio.currentTime = video.currentTime;
        }
      }, 1000);
    }

    async function loadAndPlay() {
      const rawInput = document.getElementById('ytInput').value;
      const videoId = parseVideoId(rawInput);

      if (!videoId) {
        statusText.innerText = "URLまたはVideo IDを入力してください。";
        return;
      }

      video.pause();
      audio.pause();
      statusText.innerText = "抽出中...";
      creatorCredit.innerText = "";

      try {
        const res = await fetch(\`/api/extract?url=\${encodeURIComponent(videoId)}\`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || data.error || "抽出に失敗しました");

        if (data.author) {
          creatorCredit.innerText = \`Created by: \${data.author}\`;
        }

        if (data.is_shorts) {
          playerBox.classList.add('shorts');
        } else {
          playerBox.classList.remove('shorts');
        }

        video.src = data.video_url;
        audio.src = data.audio_url;
        video.muted = true;

        video.load();
        audio.load();

        setupSync();

        statusText.innerText = "準備完了！";
        video.play().catch(() => {
          statusText.innerText = "自動再生がブロックされました。プレイヤーの再生ボタンを押してください。";
        });

      } catch (err) {
        statusText.innerText = \`エラー: \${err.message}\`;
      }
    }
  </script>
</body>
</html>`;

      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    const targetUrl = new URL(workerUrl.pathname + workerUrl.search, TARGET_API_ORIGIN).toString();

    const forwardHeaders = new Headers(request.headers);
    forwardHeaders.set("Host", new URL(TARGET_API_ORIGIN).hostname);
    forwardHeaders.delete("Accept-Encoding");

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      const responseHeaders = new Headers(response.headers);

      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

      const isTextOrScript =
        contentType.includes("text/") ||
        contentType.includes("javascript") ||
        contentType.includes("json");

      if (isTextOrScript) {
        let text = await response.text();

        text = text
          .replaceAll(TARGET_API_ORIGIN, workerUrl.origin)
          .replaceAll(TARGET_API_ORIGIN.replace("https://", "http://"), workerUrl.origin);

        const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\:[0-9]+)?/g;
        text = text.replace(urlRegex, (match) => {
          try {
            const extUrl = new URL(match);
            if (extUrl.hostname === workerUrl.hostname) return match;
            if (extUrl.hostname.includes("mangandenti.com")) {
              return workerUrl.origin;
            }
            return match;
          } catch (e) {
            return match;
          }
        });

        const escapedWorkerOrigin = workerUrl.origin.replaceAll("/", "\\/");
        text = text.replace(/https?:\\\/\\\/([^\\\/"]+)/g, (match, host) => {
          if (host.includes("mangandenti.com") || host === workerUrl.hostname) {
            return escapedWorkerOrigin;
          }
          return match;
        });

        return new Response(text, {
          status: response.status,
          headers: responseHeaders,
        });
      }

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Proxy Error: " + e.message }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }
};
