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

    // ファイル名生成
    let filename = path.basename(new URL(targetUrl).pathname);
    if (!filename || filename === '/') filename = 'index';
    if (!path.extname(filename)) filename += '.html';

    fs.writeFileSync(filename, html);
    console.log(`[Success] Saved to: ${filename}`);

  } catch (error) {
    console.error(`[Error] ${error.message}`);
  } finally {
    await browser.close();
  }
})();