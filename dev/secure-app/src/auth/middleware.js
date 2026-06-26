// Middleware trung gian — mọi route của mọi module đều phải qua đây
import { db } from '../db.js';

// Chỉ cho qua khi đã đăng nhập ĐỦ 2 tầng (mật khẩu + OTP)
export function requireAuth(req, res, next) {
  if (req.session && req.session.stage === 'authenticated' && req.session.userId) {
    const user = db
      .prepare('SELECT id, username, email FROM users WHERE id = ?')
      .get(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Phiên không hợp lệ' });
    }
    req.user = user;
    return next();
  }
  return res.status(401).json({ error: 'Chưa xác thực', stage: req.session?.stage || 'guest' });
}
