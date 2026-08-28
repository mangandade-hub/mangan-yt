# YouTube Stream Player Client

APIからストリームURLを取得して再生するフロントエンドクライアントです。
※DDoS攻撃はやめてね

## 🚀 ワンクリックデプロイ（おすすめ）

ボタンをクリックするだけで、自分のアカウントにこのプレイヤーを簡単に複製・公開できます。

### 1. Vercel にデプロイ
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mangandade-hub/mangan-yt)

### 2. Render にデプロイ
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mangandade-hub/mangan-yt)

---

## 🛠 その他のプラットフォームへの設置手順

### 3. Cloudflare Pages
1. このリポジトリを Fork（複製）します。
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create Application** > **Pages** に移動します。
3. Fork したリポジトリを選択し、ビルド設定はすべてデフォルトのまま `Save and Deploy` をクリックします。

### 4. Google Apps Script (GAS)
1. [Google Apps Script](https://script.google.com/) で新規プロジェクトを作成します。
2. このリポジトリの `Code.gs` をコピーします。
3. コピーした内容を`コード.gs`に貼り付ける
4. ファイル追加（`+`）で HTML ファイルを作成し、名前を `index` にして、このリポジトリの `index.html` のコードを貼り付けます。
5. 右上の **デプロイ** > **新しいデプロイ** から「Web アプリ」を選択して公開します。

### 5. 取得するjsonデータの例 ※ドメインがブロックされている場合は、renderなどでリバースプロキシを作りましょう
https://yt-dlp-api-node.mangandenti.com/api/extract?url=https://www.youtube.com/watch?v=動画ID
または、
https://yt-dlp-api-node.mangandenti.com/api/extract?url=動画ID
こいつを開くことで、下のjsonが出てくる
{"type":"separated","is_shorts":false,"created_by":"満俺電池","video_url":"動画ストリーミングURL","audio_url":"音声ストリーミングURL"}

※初めて作ったから動くかは知らんで。
※jsonの構成が急遽変更する場合があります
