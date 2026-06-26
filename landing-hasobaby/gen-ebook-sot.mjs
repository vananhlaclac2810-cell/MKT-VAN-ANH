// Render HTML ebook → PDF A4 using playwright-chromium
// Run:  node gen-ebook-sot.mjs
import { chromium } from 'playwright-chromium';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, statSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'public', 'ebook', 'cam-nang-xu-ly-sot.html');
const pdfPath  = path.join(__dirname, 'public', 'ebook', 'cam-nang-xu-ly-sot.pdf');

if (!existsSync(htmlPath)) {
  console.error('❌ HTML không tồn tại:', htmlPath);
  process.exit(1);
}

console.log('▶ Launching Chromium...');
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
console.log('▶ Loading:', fileUrl);
await page.goto(fileUrl, { waitUntil: 'networkidle' });

// Wait for Google Fonts to settle
await page.waitForTimeout(2000);
await page.evaluate(async () => {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
});

console.log('▶ Generating PDF...');
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 },
});

await browser.close();

const stat = statSync(pdfPath);
console.log('✓ PDF created:', pdfPath);
console.log('  Size:', (stat.size / 1024).toFixed(1), 'KB');
