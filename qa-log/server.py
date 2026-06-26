#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Web app realtime doc SQLite qa_log.db, tu refresh moi 3s bang AJAX.
Chay: python server.py   ->  http://localhost:8731
Khong can cai them thu vien (chi dung Python stdlib).
"""
import os, json, sqlite3, datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DB = r"D:\SKILL MARKETING AGENT\qa-log\qa_log.db"
PORT = 8731

PAGE = r"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QA-LOG Realtime — Vân Anh</title>
<style>
  :root{
    --bg:#0f1220; --card:#171a2b; --card2:#1d2138; --line:#2a2f4a;
    --txt:#e8ebff; --muted:#9aa0c4; --accent:#ffd166; --accent2:#7c5cff;
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:"Segoe UI",system-ui,Arial,sans-serif;background:
    radial-gradient(1200px 600px at 80% -10%, #232a52 0%, transparent 60%), var(--bg);
    color:var(--txt);min-height:100vh}
  header{padding:22px 26px;display:flex;align-items:center;justify-content:space-between;
    border-bottom:1px solid var(--line);position:sticky;top:0;
    background:rgba(15,18,32,.85);backdrop-filter:blur(8px);z-index:5}
  h1{font-size:20px;margin:0;letter-spacing:.3px}
  h1 span{color:var(--accent)}
  .stats{display:flex;gap:18px;align-items:center;font-size:13px;color:var(--muted)}
  .pill{background:var(--card2);padding:6px 12px;border-radius:999px;border:1px solid var(--line)}
  .pill b{color:var(--txt)}
  .live{display:inline-flex;align-items:center;gap:7px}
  .dot{width:9px;height:9px;border-radius:50%;background:#37e29a;box-shadow:0 0 0 0 rgba(55,226,154,.7);
    animation:pulse 1.6s infinite}
  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(55,226,154,.6)}70%{box-shadow:0 0 0 9px rgba(55,226,154,0)}100%{box-shadow:0 0 0 0 rgba(55,226,154,0)}}
  main{padding:22px 26px}
  .grid{display:grid;gap:16px}
  .row{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px 18px;
    transition:transform .25s ease, box-shadow .25s ease; animation:fadein .4s ease}
  .row:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(0,0,0,.35)}
  @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  .row.flash{outline:2px solid var(--accent);outline-offset:2px}
  .top{display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap}
  .q{font-weight:600;font-size:16px}
  .meta{font-size:12px;color:var(--muted)}
  .badge{font-size:12px;font-weight:700;padding:4px 11px;border-radius:999px;white-space:nowrap}
  .t-giadinh{background:#3a2330;color:#ff9bbf}
  .t-hoctap{background:#1f3140;color:#7fd1ff}
  .t-giaitri{background:#3a3320;color:#ffd166}
  .t-suckhoe{background:#1f3a2c;color:#65e6a6}
  .t-tuonglai{background:#2a2347;color:#b6a3ff}
  .t-khac{background:#2a2f4a;color:#aab}
  .short{margin:10px 0 6px;font-size:15px}
  .short b{color:var(--accent)}
  .long{font-size:14px;color:#cfd3f5;line-height:1.55;margin:6px 0 10px;white-space:pre-wrap}
  details summary{cursor:pointer;color:var(--muted);font-size:13px;margin-bottom:6px}
  .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  .tag{font-size:11px;background:var(--card2);border:1px solid var(--line);color:#bcc2ec;
    padding:3px 8px;border-radius:8px}
  .empty{text-align:center;color:var(--muted);padding:60px 0}
  .idx{font-size:12px;color:var(--muted);margin-right:8px}
  footer{padding:18px 26px;color:var(--muted);font-size:12px;text-align:center}
</style>
</head>
<body>
<header>
  <h1>📊 QA-LOG <span>Realtime</span> — Vân Anh</h1>
  <div class="stats">
    <span class="pill">Tổng bản ghi: <b id="count">–</b></span>
    <span class="pill live"><span class="dot"></span> Tự cập nhật mỗi <b>3s</b></span>
    <span class="pill">Cập nhật lúc <b id="updated">–</b></span>
  </div>
</header>
<main>
  <div class="grid" id="grid"><div class="empty">Đang tải dữ liệu…</div></div>
</main>
<footer>Nguồn: qa_log.db · AJAX polling 3 giây · Đóng cửa sổ terminal để tắt server</footer>

<script>
const TOPIC_CLASS = {
  "gia đình":"t-giadinh","học tập":"t-hoctap","giải trí":"t-giaitri",
  "sức khỏe":"t-suckhoe","tương lai":"t-tuonglai"
};
let lastMaxId = 0;

function esc(s){return (s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}

function render(rows){
  document.getElementById("count").textContent = rows.length;
  document.getElementById("updated").textContent = new Date().toLocaleTimeString("vi-VN");
  const grid = document.getElementById("grid");
  if(!rows.length){ grid.innerHTML = '<div class="empty">Chưa có bản ghi nào.</div>'; return; }
  let curMax = lastMaxId;
  grid.innerHTML = rows.map(r=>{
    const cls = TOPIC_CLASS[(r.topic||"").trim()] || "t-khac";
    const isNew = r.id > lastMaxId;
    if(r.id > curMax) curMax = r.id;
    const tags = (r.hashtags||"").split(/\s+/).filter(Boolean)
        .map(t=>`<span class="tag">${esc(t)}</span>`).join("");
    return `<div class="row ${isNew?'flash':''}">
      <div class="top">
        <div class="q"><span class="idx">#${r.id}</span>${esc(r.question)}</div>
        <span class="badge ${cls}">${esc(r.topic||"khác")}</span>
      </div>
      <div class="meta">🕑 ${esc(r.asked_at)}</div>
      <div class="short">⚡ <b>Ngắn:</b> ${esc(r.short_answer)}</div>
      <details><summary>Xem câu trả lời đầy đủ</summary>
        <div class="long">${esc(r.long_answer)}</div></details>
      <div class="tags">${tags}</div>
    </div>`;
  }).join("");
  lastMaxId = curMax;
}

async function tick(){
  try{
    const res = await fetch("/api/data?ts="+Date.now());
    const data = await res.json();
    render(data.rows||[]);
  }catch(e){ /* giu nguyen man hinh cu neu loi */ }
}
tick();
setInterval(tick, 3000);
</script>
</body>
</html>
"""

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):  # tat log noise
        pass

    def _send(self, code, body, ctype):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.startswith("/api/data"):
            rows = []
            try:
                conn = sqlite3.connect(DB)
                conn.row_factory = sqlite3.Row
                cur = conn.execute(
                    "SELECT id, asked_at, question, topic, short_answer, long_answer, hashtags "
                    "FROM qa_log ORDER BY id DESC")
                rows = [dict(r) for r in cur.fetchall()]
                conn.close()
            except Exception as e:
                rows = []
            body = json.dumps({"rows": rows, "server_time":
                               datetime.datetime.now().strftime("%H:%M:%S")},
                              ensure_ascii=False).encode("utf-8")
            self._send(200, body, "application/json; charset=utf-8")
        else:
            self._send(200, PAGE.encode("utf-8"), "text/html; charset=utf-8")

if __name__ == "__main__":
    print(f"QA-LOG web app chay tai: http://localhost:{PORT}")
    print(f"DB: {DB}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
