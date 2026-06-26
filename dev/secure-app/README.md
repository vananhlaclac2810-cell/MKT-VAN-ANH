# Secure Modular App

Web app bảo mật **2 tầng**, kiến trúc **module**, lưu trữ **SQLite cục bộ**.
Viết bằng **Node.js thuần (ZERO dependency)** — dùng `node:sqlite`, `node:http`, `node:crypto` built-in. Không cần `npm install`.

## Chạy

```bash
node server.js
```

Server tự tìm cổng trống (ưu tiên 4178 → 4188 → …) và tự mở trình duyệt.
Tài khoản mặc định: **admin / admin** · email nhận OTP mặc định: `vananh.laclac2810@gmail.com`.

Biến môi trường tuỳ chọn: `ADMIN_USER`, `ADMIN_PASS`, `ADMIN_EMAIL`, `MAIL_FROM`, `NO_OPEN=1` (không tự mở browser), `EXPOSE_OTP=1` (luôn hiện mã OTP để test).

## Bảo mật 2 tầng

1. **Tầng 1** — username + mật khẩu (băm bằng `scrypt`). Đổi được sau khi đăng nhập.
2. **Tầng 2** — OTP 6 số gửi về email (hạn 5 phút) qua **gws CLI** (`gmail.users.messages.send`).
   Nếu gws chưa đăng nhập, mã OTP hiện ngay trên màn hình để không bị kẹt.

Mọi route của mọi module đều đi qua middleware `requireAuth` — chỉ cho qua khi đã hoàn tất **cả 2 tầng**.

### Bật gửi OTP qua email thật

```bash
gws auth login --scopes https://www.googleapis.com/auth/gmail.send
```

## Cấu trúc

```
server.js                 # entry: chọn port trống, gắn module, mở browser
src/
  mini.js                 # mini-framework (router + session) bằng built-in
  db.js                   # node:sqlite: bảng users/notes/settings + seed admin
  auth/
    password.js           # băm/kiểm tra mật khẩu (scrypt)
    otp.js                # sinh/kiểm tra OTP
    middleware.js         # requireAuth — middleware trung gian chung
    routes.js             # /api/auth: login, verify-otp, logout, me, change-password, update-account
  email/gws.js            # gửi email qua gws.exe
  settings/routes.js      # /api/settings: số ghi chú mỗi trang
  modules/
    registry.js           # sổ đăng ký module (sidebar + gắn router qua requireAuth)
    notes/                # MODULE 1: Ghi chú (CRUD + phân trang)
public/                   # giao diện SPA (header cố định + sidebar + main)
data/app.db               # SQLite (tự tạo)
```

## Thêm module mới (mở rộng)

1. Tạo `src/modules/<ten>/routes.js` (export một `Router()` từ `../../mini.js`) và `index.js`:
   ```js
   import { someRouter } from './routes.js';
   export default { id: '<ten>', name: 'Tên hiển thị', icon: '📦', router: someRouter };
   ```
2. Khai báo trong `src/modules/registry.js`: `import x from './<ten>/index.js'` rồi thêm vào mảng `modules`.
3. (Tuỳ chọn) thêm giao diện: trong `public/js/app.js`, thêm `renderers['<ten>'] = renderHam`.

Router tự động được gắn dưới `/api/modules/<ten>` và **bắt buộc qua `requireAuth`** — không cần tự lo phần bảo mật.
