// Entry — server bảo mật 2 tầng, kiến trúc module (thuần Node built-in, không dependency)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createServer } from 'node:net';
import { exec } from 'node:child_process';

import { createApp } from './src/mini.js';
import { initDb } from './src/db.js';
import { authRouter } from './src/auth/routes.js';
import { settingsRouter } from './src/settings/routes.js';
import { requireAuth } from './src/auth/middleware.js';
import { listModules, mountModules } from './src/modules/registry.js';
import { checkGwsAuth } from './src/email/gws.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PREFERRED_PORTS = [4178, 4188, 4198, 5178, 6178];

initDb();

const app = createApp();

// --- API xác thực (tầng nền chung) ---
app.use('/api/auth', authRouter);

// --- Danh sách module cho sidebar (đã bảo vệ) ---
app.get('/api/modules', requireAuth, (req, res) => res.json({ modules: listModules() }));

// --- Cấu hình (đã bảo vệ) ---
app.use('/api/settings', requireAuth, settingsRouter);

// --- Gắn toàn bộ module (mỗi router đều qua requireAuth) ---
mountModules(app);

// --- Tĩnh + SPA fallback ---
app.useStatic(join(__dirname, 'public'));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// ---------- Tiện ích ----------
function isFree(port) {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.once('error', () => resolve(false));
    srv.once('listening', () => srv.close(() => resolve(true)));
    srv.listen(port, '127.0.0.1');
  });
}
async function findPort() {
  for (const p of PREFERRED_PORTS) if (await isFree(p)) return p;
  return 0;
}
function openBrowser(url) {
  const cmd =
    process.platform === 'win32' ? `start "" "${url}"`
    : process.platform === 'darwin' ? `open "${url}"`
    : `xdg-open "${url}"`;
  exec(cmd, { windowsHide: true }, () => {});
}

const port = await findPort();
app.listen(port, '127.0.0.1', async (server) => {
  const actual = server.address().port;
  const url = `http://127.0.0.1:${actual}`;
  console.log('\n========================================');
  console.log('  Secure Modular App đang chạy');
  console.log(`  ${url}`);
  console.log('  Tài khoản mặc định: admin / admin');
  console.log('========================================');
  const auth = await checkGwsAuth();
  if (auth.ok) console.log(`[gws] Đã đăng nhập: ${auth.email || '(không rõ email)'} — OTP sẽ gửi qua email.`);
  else console.log('[gws] CHƯA đăng nhập → OTP sẽ hiện trên màn hình đăng nhập (chạy "gws auth login" để gửi email).');
  if (process.env.NO_OPEN !== '1') openBrowser(url);
});
