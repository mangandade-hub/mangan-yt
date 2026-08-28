export default {
  async fetch(request) {
    const workerUrl = new URL(request.url);
    const TARGET_API_ORIGIN = "https://yt-dlp-api-node.mangandenti.com";

    // OPTIONS プリフライト対応 (CORS)
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

    // 転送先URLの構築
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

      // テキスト・HTML・JS・JSON 内の自鯖ドメインをプロキシURLに全自動置換
      if (isTextOrScript) {
        let text = await response.text();

        // A. 自鯖Originの絶対パス置換
        text = text
          .replaceAll(TARGET_API_ORIGIN, workerUrl.origin)
          .replaceAll(TARGET_API_ORIGIN.replace("https://", "http://"), workerUrl.origin);

        // B. テキスト/JS内の絶対パス URL (https://...) の走査・置換
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

        // C. エスケープされた URL (https:\/\/...) の置換
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

      // バイナリデータはそのままストリーム返却
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
