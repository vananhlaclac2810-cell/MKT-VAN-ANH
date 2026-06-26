// Gửi email qua Google Workspace CLI (gws) — gmail users.messages.send
import { execFile } from 'node:child_process';

// Gọi thẳng binary (gws.exe trên Windows) để truyền args dạng mảng — tránh hỏng dấu nháy JSON qua shell
const GWS_BIN = process.env.GWS_BIN || (process.platform === 'win32' ? 'gws.exe' : 'gws');
const SENDER = process.env.MAIL_FROM || ''; // để trống => dùng tài khoản gws đang đăng nhập

function buildRaw({ to, subject, html, text }) {
  // MIME tối giản; mã hoá Subject theo RFC 2047 để hỗ trợ tiếng Việt có dấu
  const encSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
  const headers = [
    SENDER ? `From: ${SENDER}` : null,
    `To: ${to}`,
    `Subject: ${encSubject}`,
    'MIME-Version: 1.0',
    `Content-Type: ${html ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
    'Content-Transfer-Encoding: base64',
  ].filter(Boolean);
  const bodyB64 = Buffer.from(html || text || '', 'utf8').toString('base64');
  const message = headers.join('\r\n') + '\r\n\r\n' + bodyB64;
  // base64url cho trường raw của Gmail API
  return Buffer.from(message, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function sendEmail({ to, subject, html, text }) {
  return new Promise((resolve, reject) => {
    const raw = buildRaw({ to, subject, html, text });
    const args = [
      'gmail',
      'users',
      'messages',
      'send',
      '--params',
      JSON.stringify({ userId: 'me' }),
      '--json',
      JSON.stringify({ raw }),
    ];
    execFile(GWS_BIN, args, { shell: true, windowsHide: true }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || stdout || err.message));
      const out = (stdout || '').toString();
      if (/"error"/.test(out) && /"code"/.test(out)) return reject(new Error(out));
      resolve(out);
    });
  });
}

// Kiểm tra gws đã đăng nhập chưa
export function checkGwsAuth() {
  return new Promise((resolve) => {
    execFile(
      GWS_BIN,
      ['gmail', 'users', 'getProfile', '--params', JSON.stringify({ userId: 'me' })],
      { windowsHide: true, maxBuffer: 1024 * 1024 },
      (err, stdout, stderr) => {
        const out = ((stdout || '') + (stderr || '')).toString();
        if (err || /authError|No credentials|401/.test(out)) return resolve({ ok: false, detail: out.slice(0, 200) });
        try {
          const j = JSON.parse(out);
          resolve({ ok: true, email: j.emailAddress || null });
        } catch {
          resolve({ ok: true, email: null });
        }
      }
    );
  });
}
