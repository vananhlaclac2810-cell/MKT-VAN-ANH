// Sổ đăng ký module — thêm module mới chỉ cần import & push vào đây
import { requireAuth } from '../auth/middleware.js';
import notesModule from './notes/index.js';

// Danh sách module đã đăng ký (thứ tự hiển thị ở sidebar)
const modules = [notesModule];

// Trả về metadata cho sidebar (không lộ router)
export function listModules() {
  return modules.map((m) => ({ id: m.id, name: m.name, icon: m.icon }));
}

// Gắn router của từng module dưới /api/modules/<id>, TẤT CẢ đều qua requireAuth
export function mountModules(app) {
  for (const m of modules) {
    app.use(`/api/modules/${m.id}`, requireAuth, m.router);
    console.log(`[module] Đã gắn: ${m.id} -> /api/modules/${m.id}`);
  }
}
