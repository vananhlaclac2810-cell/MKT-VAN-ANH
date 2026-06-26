// Module Ghi chú — CRUD không giới hạn, phân trang theo cấu hình
import { Router } from '../../mini.js';
import { db, getSetting } from '../../db.js';

export const notesRouter = Router();

// LIST — phân trang
notesRouter.get('/', (req, res) => {
  const pageSize = Math.max(1, parseInt(getSetting('notes_page_size', '5'), 10) || 5);
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const q = (req.query.q || '').toString().trim();

  const where = q ? 'WHERE user_id = ? AND (title LIKE ? OR body LIKE ?)' : 'WHERE user_id = ?';
  const args = q ? [req.user.id, `%${q}%`, `%${q}%`] : [req.user.id];

  const total = db.prepare(`SELECT COUNT(*) AS n FROM notes ${where}`).get(...args).n;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  const items = db
    .prepare(`SELECT id, title, body, created_at, updated_at FROM notes ${where} ORDER BY updated_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...args, pageSize, offset);

  res.json({ items, page: safePage, pageSize, total, totalPages });
});

// CREATE
notesRouter.post('/', (req, res) => {
  const { title, body } = req.body || {};
  if (!String(title || '').trim() && !String(body || '').trim()) {
    return res.status(400).json({ error: 'Ghi chú không được để trống' });
  }
  const info = db
    .prepare('INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)')
    .run(req.user.id, String(title || '').trim(), String(body || '').trim());
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ note });
});

// READ one
notesRouter.get('/:id', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!note) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  res.json({ note });
});

// UPDATE
notesRouter.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT id FROM notes WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  const { title, body } = req.body || {};
  db.prepare("UPDATE notes SET title = ?, body = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?").run(
    String(title || '').trim(),
    String(body || '').trim(),
    req.params.id,
    req.user.id
  );
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  res.json({ note });
});

// DELETE
notesRouter.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Không tìm thấy ghi chú' });
  res.json({ ok: true });
});
