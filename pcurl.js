#!/usr/bin/env node

const { chromium } = require('playwright'); // firefox, webkit も可
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const targetUrl = process.argv[2];

if (!targetUrl) {
  console.error('Error: URL is required.');
  process.exit(1);
}

(async () => {
  console.log(`[Info] Launching browser... Target: ${targetUrl}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 画面サイズ設定
    await page.setViewportSize({ width: 1280, height: 1024 });

    console.log(`[Info] Loading page...`);

    // ページへ移動
    // waitUntil: 'networkidle' は「通信がなくなるまで待つ」という強力なオプション
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // HTML取得
    const html = await page.content();

    // --- ファイル名生成 (URL全体を使用するロジックに変更) ---
    const urlObj = new URL(targetUrl);
    
    // ホスト名とパスを連結 (例: antigravity.google/docs/foo)
    let safeName = urlObj.hostname + urlObj.pathname;

    // 既存の拡張子(.htmlなど)があれば一旦除去（二重付与防止）
    safeName = safeName.replace(/\.(html|htm|php|jsp|asp)$/i, '');

    // スラッシュ(/)をアンダースコア(_)に置換
    safeName = safeName.replace(/\//g, '_');

    // 連続するアンダースコアを整理 & 末尾整理
    safeName = safeName.replace(/_+/g, '_').replace(/^_|_$/g, '');

    // 万が一空ならindex
    if (!safeName) safeName = 'index';

    // 必ず .html を付与
    const filename = `${safeName}.html`;
    // -------------------------------------------------------

    fs.writeFileSync(filename, html);
    console.log(`[Success] Saved to: ${filename}`);

  } catch (error) {
    console.error(`[Error] ${error.message}`);
  } finally {
    await browser.close();
  }
})();