// Các route xác thực (tầng nền chung) — KHÔNG nằm sau requireAuth (trừ các thao tác tài khoản)
import { Router } from '../mini.js';
import { db } from '../db.js';
import { hashPassword, verifyPassword } from './password.js';
import { createOtp, verifyOtp } from './otp.js';
import { requireAuth } from './middleware.js';
import { sendEmail } from '../email/gws.js';

export const authRouter = Router();

function maskEmail(email) {
  const [u, d] = String(email).split('@');
  if (!d) return email;
  const head = u.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(1, u.length - 2))}@${d}`;
}

// --- Tầng 1: username + password ---
authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(String(username));
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
  }

  // --- Tầng 2: phát OTP gửi email ---
  const { code, record } = createOtp();
  req.session.stage = 'otp_pending';
  req.session.pendingUserId = user.id;
  req.session.otp = record;

  console.log(`[otp] Mã OTP cho ${user.username} (${user.email}): ${code}`);

  let emailSent = false;
  let emailError = null;
  try {
    await sendEmail({
      to: user.email,
      subject: `Mã OTP đăng nhập: ${code}`,
      html:
        `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2937">` +
        `<p>Xin chào <b>${user.username}</b>,</p>` +
        `<p>Mã xác thực một lần (OTP) để đăng nhập của bạn là:</p>` +
        `<p style="font-size:30px;font-weight:bold;letter-spacing:6px;color:#2563eb">${code}</p>` +
        `<p>Mã có hiệu lực trong 5 phút. Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>` +
        `</div>`,
    });
    emailSent = true;
  } catch (e) {
    emailError = e.message;
    console.error('[otp] Gửi email thất bại:', e.message.slice(0, 300));
  }

  const payload = { otpRequired: true, emailHint: maskEmail(user.email), emailSent };
  // localhost: nếu không gửi được email thì trả mã để không bị khoá (tránh lock-out khi gws chưa đăng nhập)
  if (!emailSent || process.env.EXPOSE_OTP === '1') {
    payload.devCode = code;
    payload.emailError = emailError;
  }
  res.json(payload);
});

// --- Xác minh OTP ---
authRouter.post('/verify-otp', (req, res) => {
  const { code } = req.body || {};
  if (req.session.stage !== 'otp_pending' || !req.session.pendingUserId) {
    return res.status(400).json({ error: 'Chưa qua bước đăng nhập mật khẩu' });
  }
  const result = verifyOtp(req.session.otp, String(code || ''));
  if (!result.ok) {
    const msg = {
      expired: 'Mã OTP đã hết hạn, vui lòng đăng nhập lại',
      too_many_attempts: 'Nhập sai quá nhiều lần, vui lòng đăng nhập lại',
      mismatch: 'Mã OTP không đúng',
      no_otp: 'Không có mã OTP',
    }[result.reason] || 'Mã OTP không hợp lệ';
    if (result.reason === 'expired' || result.reason === 'too_many_attempts') {
      req.session.stage = 'guest';
      req.session.otp = null;
      req.session.pendingUserId = null;
    }
    return res.status(401).json({ error: msg });
  }

  const userId = req.session.pendingUserId;
  // Nâng cấp phiên: chống session fixation
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Lỗi phiên' });
    req.session.stage = 'authenticated';
    req.session.userId = userId;
    const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(userId);
    res.json({ ok: true, user });
  });
});

// --- Đăng xuất ---
authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

// --- Thông tin tài khoản hiện tại ---
authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// --- Đổi mật khẩu (sau khi đăng nhập) ---
authRouter.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 4) {
    return res.status(400).json({ error: 'Mật khẩu mới tối thiểu 4 ký tự' });
  }
  const full = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!verifyPassword(currentPassword || '', full.password_hash)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng' });
  }
  db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(
    hashPassword(newPassword),
    req.user.id
  );
  res.json({ ok: true });
});

// --- Cập nhật tài khoản: tên đăng nhập / email nhận OTP ---
authRouter.post('/update-account', requireAuth, (req, res) => {
  const { username, email } = req.body || {};
  const updates = [];
  const params = [];
  if (username && username !== req.user.username) {
    const dup = db.prepare('SELECT id FROM users WHERE username = ? AND id <> ?').get(username, req.user.id);
    if (dup) return res.status(409).json({ error: 'Tên đăng nhập đã tồn tại' });
    updates.push('username = ?');
    params.push(String(username));
  }
  if (email && email !== req.user.email) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Email không hợp lệ' });
    updates.push('email = ?');
    params.push(String(email));
  }
  if (!updates.length) return res.json({ ok: true, user: req.user });
  params.push(req.user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...params);
  const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(req.user.id);
  res.json({ ok: true, user });
});
