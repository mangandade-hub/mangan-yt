# YouTube Stream Player Client

API（`https://yt-dlp-api-node.mangandenti.com`）からストリームURLを取得して再生するフロントエンドクライアントです。

## 🚀 ワンクリックデプロイ（おすすめ）

ボタンをクリックするだけで、自分のアカウントにこのプレイヤーを簡単に複製・公開できます。

### 1. Vercel にデプロイ
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mangandade-hub/youtube-Streaming)

### 2. Render にデプロイ
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mangandade-hub/youtube-Streaming)

---

## 🛠 その他のプラットフォームへの設置手順

### 3. Cloudflare Pages
1. このリポジトリを Fork（複製）します。
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create Application** > **Pages** に移動します。
3. Fork したリポジトリを選択し、ビルド設定はすべてデフォルトのまま `Save and Deploy` をクリックします。

### 4. Google Apps Script (GAS)
1. [Google Apps Script](https://script.google.com/) で新規プロジェクトを作成します。
2. `Code.gs` の内容をこのリポジトリの `Code.gs` からコピペします。
3. ファイル追加（`+`）で HTML ファイルを作成し、名前を `index` にして、このリポジトリの `index.html` のコードを貼り付けます。
4. 右上の **デプロイ** > **新しいデプロイ** から「Web アプリ」を選択して公開します。
