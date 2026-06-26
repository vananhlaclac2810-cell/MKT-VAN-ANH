// Mini web framework bằng Node built-in (thay express) — ZERO dependency
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

// ---------- Router ----------
export function Router() {
  const routes = [];
  const make = (method) => (path, ...handlers) => routes.push({ method, path, handlers });
  return {
    _routes: routes,
    get: make('GET'),
    post: make('POST'),
    put: make('PUT'),
    delete: make('DELETE'),
  };
}

// pattern -> {regex, keys}; hỗ trợ :param và '*'
function compile(prefix, path) {
  let full = (prefix + path).replace(/\/+/g, '/');
  if (full.length > 1) full = full.replace(/\/$/, ''); // bỏ '/' cuối (trừ root)
  const keys = [];
  if (full === '*' || path === '*') return { regex: /^.*$/, keys, wildcard: true };
  const src = full.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; });
  return { regex: new RegExp(`^${src}/?$`), keys, wildcard: false };
}

// ---------- App ----------
export function createApp() {
  const layers = []; // {method|'ALL', regex, keys, handlers, isStatic}
  const app = {};

  const addRoute = (method, path, handlers) => {
    const { regex, keys } = compile('', path);
    layers.push({ method, regex, keys, handlers });
  };
  for (const m of ['get', 'post', 'put', 'delete']) {
    app[m] = (path, ...handlers) => addRoute(m.toUpperCase(), path, handlers);
  }

  // use(fn) | use(prefix, ...mw) | use(prefix, ...guards, router)
  app.use = (a, ...rest) => {
    if (typeof a === 'function' && rest.length === 0) {
      layers.push({ method: 'ALL', regex: /^.*$/, keys: [], handlers: [a] }); // global mw
      return;
    }
    const prefix = typeof a === 'string' ? a : '';
    const items = typeof a === 'string' ? rest : [a, ...rest];
    const last = items[items.length - 1];
    const guards = items.slice(0, -1).filter((f) => typeof f === 'function');
    if (last && last._routes) {
      for (const rt of last._routes) {
        const { regex, keys } = compile(prefix, rt.path);
        layers.push({ method: rt.method, regex, keys, handlers: [...guards, ...rt.handlers] });
      }
    } else if (typeof last === 'function') {
      // middleware gắn theo prefix
      const { regex, keys } = compile(prefix, '*');
      layers.push({ method: 'ALL', regex, keys, handlers: [...guards, last], prefixMw: true });
    }
  };

  // static handler
  app.useStatic = (dir) => {
    layers.push({ method: 'GET', regex: /^.*$/, keys: [], isStatic: dir });
  };

  async function dispatch(req, res) {
    const matched = [];
    for (const L of layers) {
      if (L.method !== 'ALL' && L.method !== req.method) continue;
      const m = L.regex.exec(req.path);
      if (!m) continue;
      matched.push({ L, m });
    }
    let i = 0;
    const next = async () => {
      if (i >= matched.length) return notFound(req, res);
      const { L, m } = matched[i++];
      if (L.isStatic) {
        const served = await tryStatic(L.isStatic, req, res);
        if (served) return;
        return next();
      }
      // gán params cho layer hiện tại
      req.params = {};
      L.keys.forEach((k, idx) => (req.params[k] = decodeURIComponent(m[idx + 1] || '')));
      let idx = 0;
      const runHandlers = async () => {
        if (idx >= L.handlers.length) return next();
        const h = L.handlers[idx++];
        await h(req, res, runHandlers);
      };
      await runHandlers();
    };
    await next();
  }

  app.listen = (port, host, cb) => {
    const server = createServer(async (rawReq, res) => {
      try {
        const req = await buildReq(rawReq);
        decorate(res);
        attachSession(req, res);
        await dispatch(req, res);
        if (!res.writableEnded) notFound(req, res);
      } catch (e) {
        console.error('[server] Lỗi xử lý:', e);
        if (!res.writableEnded) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Lỗi máy chủ' })); }
      }
    });
    server.listen(port, host, () => cb && cb(server));
    return server;
  };

  return app;
}

function notFound(req, res) {
  if (res.writableEnded) return;
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Not found' }));
}

// ---------- Request ----------
async function buildReq(rawReq) {
  const url = new URL(rawReq.url, 'http://localhost');
  const req = rawReq;
  req.path = url.pathname;
  req.query = Object.fromEntries(url.searchParams.entries());
  req.params = {};
  req.body = {};
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const chunks = [];
    for await (const c of rawReq) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8');
    if (raw) { try { req.body = JSON.parse(raw); } catch { req.body = {}; } }
  }
  return req;
}

// ---------- Response helpers ----------
function decorate(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    if (res.writableEnded) return;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
  };
  res.send = (txt) => {
    if (res.writableEnded) return;
    res.end(txt);
  };
  res.clearCookie = (name) => appendCookie(res, `${name}=; Path=/; HttpOnly; Max-Age=0`);
  res.sendFile = async (file) => {
    try {
      const data = await readFile(file);
      res.setHeader('Content-Type', mime(file));
      res.end(data);
    } catch {
      notFound({ path: '' }, res);
    }
  };
}

function appendCookie(res, cookie) {
  const prev = res.getHeader('Set-Cookie');
  const arr = Array.isArray(prev) ? prev : prev ? [prev] : [];
  arr.push(cookie);
  res.setHeader('Set-Cookie', arr);
}

// ---------- Session (cookie + in-memory store) ----------
const SESSIONS = new Map();
const COOKIE = 'sid';
const MAX_AGE = 60 * 60 * 8; // 8h

function parseCookies(header = '') {
  const out = {};
  header.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

function attachSession(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  let sid = cookies[COOKIE];
  if (!sid || !SESSIONS.has(sid)) {
    sid = randomBytes(24).toString('hex');
    SESSIONS.set(sid, {});
    appendCookie(res, `${COOKIE}=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`);
  }
  let data = SESSIONS.get(sid);
  Object.defineProperty(req, 'session', { value: makeSession(req, res, sid, data), writable: true, configurable: true });
}

function makeSession(req, res, sid, data) {
  Object.defineProperty(data, 'regenerate', {
    value: (cb) => {
      SESSIONS.delete(sid);
      const newSid = randomBytes(24).toString('hex');
      const fresh = {};
      SESSIONS.set(newSid, fresh);
      appendCookie(res, `${COOKIE}=${newSid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}`);
      req.session = makeSession(req, res, newSid, fresh);
      cb && cb(null);
    },
    enumerable: false, configurable: true,
  });
  Object.defineProperty(data, 'destroy', {
    value: (cb) => { SESSIONS.delete(sid); cb && cb(null); },
    enumerable: false, configurable: true,
  });
  return data;
}

// ---------- Static / mime ----------
const MIMES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon',
};
function mime(file) { return MIMES[extname(file).toLowerCase()] || 'application/octet-stream'; }

async function tryStatic(dir, req, res) {
  if (req.path.includes('..')) return false;
  const rel = req.path === '/' ? '/index.html' : req.path;
  const file = dir + rel;
  try {
    const data = await readFile(file);
    res.setHeader('Content-Type', mime(file));
    res.end(data);
    return true;
  } catch { return false; }
}
