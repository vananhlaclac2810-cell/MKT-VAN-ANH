// Cào bài viết + bình luận VnExpress bằng Playwright (vai trò tương đương lightpanda)
const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'https://vnexpress.net/ai-giu-mat-guong-tay-ho-5087447.html';

(async () => {
  const os = require('os');
  const path = require('path');
  // Dùng Chromium có sẵn của Playwright (chromium-1148) để khỏi tải lại
  const localChromium = path.join(
    os.homedir(),
    'AppData/Local/ms-playwright/chromium-1148/chrome-win/chrome.exe'
  );
  const launchOpts = { headless: true };
  if (fs.existsSync(localChromium)) launchOpts.executablePath = localChromium;
  else launchOpts.channel = 'msedge'; // fallback: Microsoft Edge
  const browser = await chromium.launch(launchOpts);
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    locale: 'vi-VN',
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // ---- Bài viết ----
  const article = await page.evaluate(() => {
    const txt = (el) => (el ? el.textContent.trim().replace(/\s+/g, ' ') : '');
    const title = txt(document.querySelector('h1.title-detail'));
    const desc = txt(document.querySelector('p.description'));
    const paras = Array.from(
      document.querySelectorAll('article.fck_detail > p.Normal, article.fck_detail > p')
    )
      .map((p) => p.textContent.trim().replace(/\s+/g, ' '))
      .filter((t) => t.length > 0);

    // tìm objectid / siteid cho API bình luận
    let objectid = '', siteid = '1000000', objecttype = '1';
    const box = document.querySelector('[data-objectid]');
    if (box) {
      objectid = box.getAttribute('data-objectid') || '';
      siteid = box.getAttribute('data-siteid') || siteid;
      objecttype = box.getAttribute('data-objecttype') || objecttype;
    }
    // fallback: lấy id từ URL ...-NNNNNN.html
    if (!objectid) {
      const m = location.href.match(/-(\d+)\.html/);
      if (m) objectid = m[1];
    }
    return { title, desc, paras, objectid, siteid, objecttype };
  });

  // ---- Bình luận (API JSON của VnExpress) ----
  const api =
    `https://usi-saas.vnexpress.net/index/get?offset=0&limit=500&frommobile=0` +
    `&sort=like&is_onload=1&objectid=${article.objectid}&objecttype=${article.objecttype}&siteid=${article.siteid}`;

  let comments = [];
  let total = 0;
  try {
    // Lấy JSON bình luận qua chính trình duyệt (dùng network stack của Chromium → vượt được proxy SSL)
    const json = await page.evaluate(async (u) => {
      const r = await fetch(u, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'include',
      });
      return await r.json();
    }, api);
    const items = (json && json.data && json.data.items) || [];
    total = (json && json.data && json.data.total) || items.length;
    const flat = (arr) =>
      arr.map((c) => ({
        name: c.full_name || c.user_name || 'Ẩn danh',
        content: (c.content || '').replace(/<[^>]+>/g, '').trim(),
        like: c.userlike || c.like || 0,
        replies:
          c.replys && c.replys.items ? flat(c.replys.items) : [],
      }));
    comments = flat(items);
  } catch (e) {
    console.error('Comment API error:', e.message);
  }

  const out = { url: URL, ...article, total_comments: total, comments };
  fs.writeFileSync('result.json', JSON.stringify(out, null, 2), 'utf8');

  // In tóm tắt ra console
  console.log('TITLE:', article.title);
  console.log('DESC:', article.desc);
  console.log('BODY paragraphs:', article.paras.length);
  console.log('objectid/siteid:', article.objectid, article.siteid);
  console.log('TOTAL comments:', total, '| fetched top-level:', comments.length);
  await browser.close();
})();
