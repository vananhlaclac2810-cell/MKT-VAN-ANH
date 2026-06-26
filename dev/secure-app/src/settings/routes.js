// Cấu hình ứng dụng (lưu trong SQLite) — sau requireAuth
import { Router } from '../mini.js';
import { getSetting, setSetting } from '../db.js';

export const settingsRouter = Router();

settingsRouter.get('/', (req, res) => {
  res.json({
    notes_page_size: parseInt(getSetting('notes_page_size', '5'), 10),
  });
});

settingsRouter.put('/', (req, res) => {
  const { notes_page_size } = req.body || {};
  if (notes_page_size !== undefined) {
    const n = parseInt(notes_page_size, 10);
    if (!Number.isFinite(n) || n < 1 || n > 100) {
      return res.status(400).json({ error: 'Số dòng/trang phải từ 1 đến 100' });
    }
    setSetting('notes_page_size', n);
  }
  res.json({ ok: true, notes_page_size: parseInt(getSetting('notes_page_size', '5'), 10) });
});
