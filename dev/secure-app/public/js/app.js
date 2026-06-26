// ===== Frontend SPA — vanilla JS =====
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- API ----
async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw Object.assign(new Error(data.error || `Lỗi ${res.status}`), { status: res.status, data });
  return data;
}

// ---- Toast ----
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toast').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ---- Modal ----
function modal({ title, bodyHtml, footHtml, onMount }) {
  const root = $('#modal-root');
  root.innerHTML = `
    <div class="modal-backdrop">
      <div class="modal">
        <header><h3>${esc(title)}</h3><button class="x" data-close>×</button></header>
        <div class="body">${bodyHtml}</div>
        <div class="foot">${footHtml || ''}</div>
      </div>
    </div>`;
  const close = () => (root.innerHTML = '');
  root.querySelector('[data-close]').onclick = close;
  root.querySelector('.modal-backdrop').addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('modal-backdrop')) close();
  });
  if (onMount) onMount(root, close);
  return close;
}

// ===== State =====
const state = { user: null, modules: [], current: null };

// ===== Auth flow =====
function showAuth() { $('#auth-view').hidden = false; $('#app-view').hidden = true; }
function showApp() { $('#auth-view').hidden = true; $('#app-view').hidden = false; }

function setMsg(id, text, kind = 'err') {
  const el = $(id);
  el.className = `msg ${kind}`;
  el.textContent = text;
}

$('#login-card').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#login-btn');
  btn.disabled = true;
  try {
    const r = await api('/api/auth/login', {
      method: 'POST',
      body: { username: $('#login-username').value.trim(), password: $('#login-password').value },
    });
    // Sang tầng OTP
    $('#login-card').hidden = true;
    $('#otp-card').hidden = false;
    $('#otp-code').value = '';
    $('#otp-code').focus();
    let sub = `Mã OTP đã gửi tới <b>${esc(r.emailHint)}</b>.`;
    if (r.devCode) {
      sub += `<br><span style="color:#b45309">Chưa gửi được email (gws chưa đăng nhập) — mã của bạn: <b style="font-size:18px">${esc(r.devCode)}</b></span>`;
    }
    $('#otp-sub').innerHTML = sub;
    $('#login-msg').className = 'msg';
  } catch (err) {
    setMsg('#login-msg', err.message);
  } finally {
    btn.disabled = false;
  }
});

$('#otp-card').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = $('#otp-btn');
  btn.disabled = true;
  try {
    const r = await api('/api/auth/verify-otp', { method: 'POST', body: { code: $('#otp-code').value.trim() } });
    state.user = r.user;
    $('#otp-card').hidden = true;
    $('#login-card').hidden = false;
    await bootApp();
  } catch (err) {
    setMsg('#otp-msg', err.message);
    if (/đăng nhập lại/.test(err.message)) {
      setTimeout(() => { $('#otp-card').hidden = true; $('#login-card').hidden = false; }, 1500);
    }
  } finally {
    btn.disabled = false;
  }
});

$('#otp-back').onclick = () => { $('#otp-card').hidden = true; $('#login-card').hidden = false; };

// ===== App shell =====
function avatarText(name) { return (name || '?').trim().charAt(0).toUpperCase(); }

function renderAccount() {
  const u = state.user;
  $('#acct-name').textContent = u.username;
  $('#acct-avatar').textContent = avatarText(u.username);
  $('#menu-name').textContent = u.username;
  $('#menu-mail').textContent = u.email;
}

function renderSidebar() {
  const nav = $('#module-nav');
  nav.innerHTML = state.modules
    .map((m) => `<button class="nav-item" data-mod="${esc(m.id)}"><span class="ic">${m.icon || '📦'}</span> ${esc(m.name)}</button>`)
    .join('');
  $$('#module-nav .nav-item').forEach((b) => (b.onclick = () => openModule(b.dataset.mod)));
}

function setActiveNav(id) {
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.mod === id));
  $('#nav-settings').classList.toggle('active', id === '__settings');
}

// ----- Frontend module renderers (mở rộng: thêm key theo id module) -----
const renderers = {
  notes: renderNotes,
};

function openModule(id) {
  state.current = id;
  setActiveNav(id);
  $('#sidebar').classList.remove('open');
  const fn = renderers[id];
  if (fn) fn();
  else $('#main-content').innerHTML = `<div class="empty">Module "<b>${esc(id)}</b>" chưa có giao diện.</div>`;
}

async function bootApp() {
  showApp();
  renderAccount();
  const r = await api('/api/modules');
  state.modules = r.modules;
  renderSidebar();
  if (state.modules[0]) openModule(state.modules[0].id);
}

// ===== Account dropdown =====
$('#acct-btn').onclick = (e) => { e.stopPropagation(); $('#acct-menu').hidden = !$('#acct-menu').hidden; };
document.addEventListener('click', () => ($('#acct-menu').hidden = true));
$('#acct-menu').addEventListener('click', (e) => e.stopPropagation());
$('#menu-toggle').onclick = () => $('#sidebar').classList.toggle('open');

$('#mi-logout').onclick = async () => {
  await api('/api/auth/logout', { method: 'POST' });
  state.user = null;
  showAuth();
  $('#login-password').value = '';
  toast('Đã đăng xuất', 'ok');
};

$('#mi-password').onclick = () => {
  modal({
    title: '🔑 Đổi mật khẩu',
    bodyHtml: `
      <div class="field"><label>Mật khẩu hiện tại</label><input id="cp-cur" type="password" /></div>
      <div class="field"><label>Mật khẩu mới</label><input id="cp-new" type="password" /></div>
      <div class="field"><label>Nhập lại mật khẩu mới</label><input id="cp-new2" type="password" /></div>
      <div class="msg" id="cp-msg"></div>`,
    footHtml: `<button class="btn" data-close>Huỷ</button><button class="btn btn-primary" id="cp-save">Lưu</button>`,
    onMount: (root, close) => {
      root.querySelector('#cp-save').onclick = async () => {
        const cur = root.querySelector('#cp-cur').value;
        const n1 = root.querySelector('#cp-new').value;
        const n2 = root.querySelector('#cp-new2').value;
        if (n1 !== n2) return (root.querySelector('#cp-msg').className = 'msg err', root.querySelector('#cp-msg').textContent = 'Hai mật khẩu mới không khớp');
        try {
          await api('/api/auth/change-password', { method: 'POST', body: { currentPassword: cur, newPassword: n1 } });
          close(); toast('Đã đổi mật khẩu', 'ok');
        } catch (err) {
          root.querySelector('#cp-msg').className = 'msg err';
          root.querySelector('#cp-msg').textContent = err.message;
        }
      };
    },
  });
};

$('#mi-account').onclick = () => {
  const u = state.user;
  modal({
    title: '👤 Thông tin tài khoản',
    bodyHtml: `
      <div class="field"><label>Tên đăng nhập</label><input id="ac-user" value="${esc(u.username)}" /></div>
      <div class="field"><label>Email nhận OTP</label><input id="ac-email" value="${esc(u.email)}" /></div>
      <div class="msg" id="ac-msg"></div>`,
    footHtml: `<button class="btn" data-close>Huỷ</button><button class="btn btn-primary" id="ac-save">Lưu</button>`,
    onMount: (root, close) => {
      root.querySelector('#ac-save').onclick = async () => {
        try {
          const r = await api('/api/auth/update-account', {
            method: 'POST',
            body: { username: root.querySelector('#ac-user').value.trim(), email: root.querySelector('#ac-email').value.trim() },
          });
          state.user = r.user; renderAccount(); close(); toast('Đã cập nhật tài khoản', 'ok');
        } catch (err) {
          root.querySelector('#ac-msg').className = 'msg err';
          root.querySelector('#ac-msg').textContent = err.message;
        }
      };
    },
  });
};

// ===== Settings =====
$('#nav-settings').onclick = async () => {
  setActiveNav('__settings');
  let s = { notes_page_size: 5 };
  try { s = await api('/api/settings'); } catch {}
  modal({
    title: '⚙️ Cấu hình',
    bodyHtml: `
      <div class="field">
        <label>Số ghi chú mỗi trang</label>
        <input id="set-pagesize" type="number" min="1" max="100" value="${esc(s.notes_page_size)}" />
      </div>
      <div class="msg" id="set-msg"></div>`,
    footHtml: `<button class="btn" data-close>Huỷ</button><button class="btn btn-primary" id="set-save">Lưu</button>`,
    onMount: (root, close) => {
      root.querySelector('#set-save').onclick = async () => {
        try {
          await api('/api/settings', { method: 'PUT', body: { notes_page_size: parseInt(root.querySelector('#set-pagesize').value, 10) } });
          close(); toast('Đã lưu cấu hình', 'ok');
          if (state.current === 'notes') renderNotes();
        } catch (err) {
          root.querySelector('#set-msg').className = 'msg err';
          root.querySelector('#set-msg').textContent = err.message;
        }
      };
    },
  });
};

// ===== Module: Ghi chú =====
const notesState = { page: 1, q: '' };

async function renderNotes() {
  const main = $('#main-content');
  main.innerHTML = `
    <div class="page-head">
      <h2>📝 Ghi chú</h2>
      <div class="toolbar">
        <input class="search" id="notes-search" placeholder="Tìm ghi chú..." value="${esc(notesState.q)}" />
        <button class="btn btn-primary" id="note-new">+ Ghi chú mới</button>
      </div>
    </div>
    <div id="notes-list"><div class="empty">Đang tải...</div></div>
    <div class="pager" id="notes-pager"></div>`;

  $('#note-new').onclick = () => editNote(null);
  let t;
  $('#notes-search').oninput = (e) => {
    clearTimeout(t);
    t = setTimeout(() => { notesState.q = e.target.value.trim(); notesState.page = 1; loadNotes(); }, 300);
  };
  loadNotes();
}

async function loadNotes() {
  const wrap = $('#notes-list');
  try {
    const r = await api(`/api/modules/notes/?page=${notesState.page}&q=${encodeURIComponent(notesState.q)}`);
    if (!r.items.length) {
      wrap.innerHTML = `<div class="empty">${notesState.q ? 'Không tìm thấy ghi chú phù hợp.' : 'Chưa có ghi chú nào. Bấm “+ Ghi chú mới” để bắt đầu.'}</div>`;
      $('#notes-pager').innerHTML = '';
      return;
    }
    wrap.innerHTML = `<div class="note-grid">${r.items.map(noteCard).join('')}</div>`;
    $$('#notes-list [data-edit]').forEach((b) => (b.onclick = () => editNote(b.dataset.edit)));
    $$('#notes-list [data-del]').forEach((b) => (b.onclick = () => delNote(b.dataset.del)));
    renderPager(r);
  } catch (err) {
    wrap.innerHTML = `<div class="empty">Lỗi tải ghi chú: ${esc(err.message)}</div>`;
  }
}

function noteCard(n) {
  const date = (n.updated_at || n.created_at || '').replace('T', ' ').slice(0, 16);
  return `
    <div class="note-card">
      <h3>${esc(n.title) || '<span style="color:#9ca3af">(Không tiêu đề)</span>'}</h3>
      <div class="body">${esc(n.body)}</div>
      <div class="meta">🕒 ${esc(date)}</div>
      <div class="row">
        <button class="btn btn-sm" data-edit="${n.id}">✏️ Sửa</button>
        <button class="btn btn-sm btn-danger" data-del="${n.id}">🗑️ Xoá</button>
      </div>
    </div>`;
}

function renderPager(r) {
  const p = $('#notes-pager');
  if (r.totalPages <= 1) { p.innerHTML = `<span class="info">${r.total} ghi chú</span>`; return; }
  p.innerHTML = `
    <button class="btn btn-sm" id="pg-prev" ${r.page <= 1 ? 'disabled' : ''}>← Trước</button>
    <span class="info">Trang ${r.page}/${r.totalPages} · ${r.total} ghi chú</span>
    <button class="btn btn-sm" id="pg-next" ${r.page >= r.totalPages ? 'disabled' : ''}>Sau →</button>`;
  $('#pg-prev') && ($('#pg-prev').onclick = () => { notesState.page--; loadNotes(); });
  $('#pg-next') && ($('#pg-next').onclick = () => { notesState.page++; loadNotes(); });
}

async function editNote(id) {
  let note = { title: '', body: '' };
  if (id) { try { note = (await api(`/api/modules/notes/${id}`)).note; } catch (e) { return toast(e.message, 'err'); } }
  modal({
    title: id ? '✏️ Sửa ghi chú' : '📝 Ghi chú mới',
    bodyHtml: `
      <div class="field"><label>Tiêu đề</label><input id="n-title" value="${esc(note.title)}" placeholder="Tiêu đề..." /></div>
      <div class="field"><label>Nội dung</label><textarea id="n-body" placeholder="Nội dung ghi chú...">${esc(note.body)}</textarea></div>
      <div class="msg" id="n-msg"></div>`,
    footHtml: `<button class="btn" data-close>Huỷ</button><button class="btn btn-primary" id="n-save">${id ? 'Lưu thay đổi' : 'Tạo'}</button>`,
    onMount: (root, close) => {
      root.querySelector('#n-title').focus();
      root.querySelector('#n-save').onclick = async () => {
        const body = { title: root.querySelector('#n-title').value, body: root.querySelector('#n-body').value };
        try {
          if (id) await api(`/api/modules/notes/${id}`, { method: 'PUT', body });
          else { await api('/api/modules/notes/', { method: 'POST', body }); notesState.page = 1; }
          close(); toast(id ? 'Đã lưu' : 'Đã tạo ghi chú', 'ok'); loadNotes();
        } catch (err) {
          root.querySelector('#n-msg').className = 'msg err';
          root.querySelector('#n-msg').textContent = err.message;
        }
      };
    },
  });
}

async function delNote(id) {
  modal({
    title: '🗑️ Xoá ghi chú',
    bodyHtml: `<p>Bạn chắc chắn muốn xoá ghi chú này? Hành động không thể hoàn tác.</p>`,
    footHtml: `<button class="btn" data-close>Huỷ</button><button class="btn btn-danger" id="del-ok">Xoá</button>`,
    onMount: (root, close) => {
      root.querySelector('#del-ok').onclick = async () => {
        try { await api(`/api/modules/notes/${id}`, { method: 'DELETE' }); close(); toast('Đã xoá', 'ok'); loadNotes(); }
        catch (err) { close(); toast(err.message, 'err'); }
      };
    },
  });
}

// ===== Khởi động: kiểm tra phiên sẵn có =====
(async function init() {
  try {
    const r = await api('/api/auth/me');
    state.user = r.user;
    await bootApp();
  } catch {
    showAuth();
  }
})();
