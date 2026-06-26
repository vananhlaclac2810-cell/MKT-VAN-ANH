// Tầng cơ sở dữ liệu — dùng node:sqlite (built-in của Node 22+/24)
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { hashPassword } from './auth/password.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, 'app.db'));

// Tài khoản admin mặc định
const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || 'admin';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vananh.laclac2810@gmail.com';

export function initDb() {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email         TEXT NOT NULL,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      title      TEXT NOT NULL DEFAULT '',
      body       TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed admin nếu chưa có
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(DEFAULT_ADMIN_USER);
  if (!existing) {
    db.prepare('INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)').run(
      DEFAULT_ADMIN_USER,
      hashPassword(DEFAULT_ADMIN_PASS),
      DEFAULT_ADMIN_EMAIL
    );
    console.log(`[db] Đã seed tài khoản mặc định: ${DEFAULT_ADMIN_USER}/${DEFAULT_ADMIN_PASS} (email OTP: ${DEFAULT_ADMIN_EMAIL})`);
  }

  // Seed cấu hình mặc định
  const defaults = { notes_page_size: '5' };
  for (const [key, value] of Object.entries(defaults)) {
    const row = db.prepare('SELECT key FROM settings WHERE key = ?').get(key);
    if (!row) db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(key, value);
  }
}

// Helpers cấu hình
export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, String(value));
}
