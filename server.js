// Sistema de Rifas — servidor sem dependências externas (Node 22.5+).
// Rodar: node server.js   →   http://localhost:3000
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BODY = 40 * 1024 * 1024;
const MAX_NUMBERS = 5000;
const MAX_PHOTOS = 8;

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------------------------------------------------------------- banco
const db = new DatabaseSync(path.join(DATA_DIR, 'rifas.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS raffles (
    id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE, user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
    total_numbers INTEGER NOT NULL, price_cents INTEGER NOT NULL,
    pix_key TEXT NOT NULL, whatsapp TEXT NOT NULL,
    reserve_minutes INTEGER NOT NULL, max_per_buyer INTEGER,
    draw_date INTEGER, status TEXT NOT NULL DEFAULT 'open',
    winner_number INTEGER, drawn_at INTEGER, created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY, raffle_id INTEGER NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL, position INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY, raffle_id INTEGER NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE, buyer_name TEXT NOT NULL, buyer_phone TEXT NOT NULL,
    numbers TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, paid_at INTEGER
  );
  -- Um número só pode pertencer a um pedido ativo (pendente ou pago) por vez.
  CREATE TABLE IF NOT EXISTS tickets (
    raffle_id INTEGER NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    number INTEGER NOT NULL, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    PRIMARY KEY (raffle_id, number)
  );
  CREATE INDEX IF NOT EXISTS idx_orders_raffle ON orders(raffle_id, status);
`);

const q = (sql) => db.prepare(sql);
function tx(fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const r = fn(); db.exec('COMMIT'); return r; }
  catch (e) { db.exec('ROLLBACK'); throw e; }
}

// Reservas pendentes vencidas liberam os números.
function expireOrders() {
  const now = Date.now();
  const expired = q(`SELECT id FROM orders WHERE status='pending' AND expires_at <= ?`).all(now);
  if (!expired.length) return;
  tx(() => {
    for (const o of expired) {
      q(`DELETE FROM tickets WHERE order_id=?`).run(o.id);
      q(`UPDATE orders SET status='expired' WHERE id=?`).run(o.id);
    }
  });
}
setInterval(expireOrders, 30_000).unref();

// ---------------------------------------------------------------- utilitários
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (msg, status = 400) => { throw new HttpError(status, msg); };

const str = (v, max, label, required = true) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) bad(`Preencha o campo "${label}".`);
  if (s.length > max) bad(`O campo "${label}" é muito longo.`);
  return s;
};
const digits = (v) => String(v ?? '').replace(/\D/g, '');
function phone(v, label) {
  const d = digits(v);
  if (d.length < 10 || d.length > 13) bad(`Informe um ${label} válido, com DDD.`);
  return d;
}
function intIn(v, min, max, label) {
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) bad(`"${label}" deve ser um número entre ${min} e ${max}.`);
  return n;
}
function shortName(name) {
  const p = name.trim().split(/\s+/);
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0].toUpperCase()}.` : p[0];
}
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
function savePhoto(dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) bad('Foto inválida. Use imagens JPG, PNG ou WebP.');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 5 * 1024 * 1024) bad('Cada foto pode ter no máximo 5 MB.');
  const name = `${crypto.randomBytes(12).toString('hex')}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return name;
}
function removePhotoFile(filename) {
  fs.rm(path.join(UPLOAD_DIR, path.basename(filename)), { force: true }, () => {});
}

function counts(raffleId) {
  const r = q(`SELECT
      SUM(o.status='paid') AS paid, SUM(o.status='pending') AS pending
    FROM tickets t JOIN orders o ON o.id=t.order_id WHERE t.raffle_id=?`).get(raffleId);
  return { paid: r.paid || 0, pending: r.pending || 0 };
}
function photosOf(raffleId) {
  return q(`SELECT id, filename FROM photos WHERE raffle_id=? ORDER BY position`).all(raffleId)
    .map((p) => ({ id: p.id, url: `/uploads/${p.filename}` }));
}
function canDraw(raffle, c) {
  if (raffle.status !== 'open' || c.paid === 0) return false;
  if (c.paid === raffle.total_numbers) return true;
  return raffle.draw_date != null && Date.now() >= raffle.draw_date;
}
function winnerOf(raffle) {
  if (raffle.status !== 'drawn') return null;
  const o = q(`SELECT o.buyer_name, o.buyer_phone FROM tickets t JOIN orders o ON o.id=t.order_id
               WHERE t.raffle_id=? AND t.number=?`).get(raffle.id, raffle.winner_number);
  return { number: raffle.winner_number, name: o?.buyer_name || '', phone: o?.buyer_phone || '', drawn_at: raffle.drawn_at };
}

// Valida os campos de uma rifa (criação e edição).
function raffleFields(body, { locked = false } = {}) {
  const f = {
    title: str(body.title, 120, 'Título'),
    description: str(body.description, 5000, 'Descrição', false),
    pix_key: str(body.pix_key, 200, 'Chave PIX'),
    whatsapp: phone(body.whatsapp, 'WhatsApp'),
    reserve_minutes: intIn(body.reserve_minutes, 5, 60 * 24 * 30, 'Tempo de reserva (minutos)'),
    max_per_buyer: body.max_per_buyer == null || body.max_per_buyer === ''
      ? null : intIn(body.max_per_buyer, 1, MAX_NUMBERS, 'Limite por comprador'),
    draw_date: body.draw_date == null || body.draw_date === ''
      ? null : intIn(body.draw_date, 0, 4102444800000, 'Data do sorteio'),
  };
  if (!locked) {
    f.total_numbers = intIn(body.total_numbers, 2, MAX_NUMBERS, 'Quantidade de números');
    f.price_cents = intIn(body.price_cents, 1, 100_000_00, 'Valor de cada número');
  }
  return f;
}

// ---------------------------------------------------------------- rotas
const routes = [];
const route = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  routes.push({ method, re, keys, handler, auth: !!opts.auth });
};

// --- conta
route('POST', '/api/register', ({ body, res }) => {
  const name = str(body.name, 80, 'Nome');
  const email = str(body.email, 160, 'E-mail').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) bad('Informe um e-mail válido.');
  const password = typeof body.password === 'string' ? body.password : '';
  if (password.length < 6) bad('A senha deve ter pelo menos 6 caracteres.');
  if (q(`SELECT 1 FROM users WHERE email=?`).get(email)) bad('Já existe uma conta com este e-mail.');
  const salt = crypto.randomBytes(16).toString('hex');
  const r = q(`INSERT INTO users (name,email,pass_hash,salt,created_at) VALUES (?,?,?,?,?)`)
    .run(name, email, hashPassword(password, salt), salt, Date.now());
  startSession(res, Number(r.lastInsertRowid));
  return { name, email };
});

route('POST', '/api/login', ({ body, res }) => {
  const email = str(body.email, 160, 'E-mail').toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  const u = q(`SELECT * FROM users WHERE email=?`).get(email);
  const ok = u && crypto.timingSafeEqual(
    Buffer.from(hashPassword(password, u.salt), 'hex'), Buffer.from(u.pass_hash, 'hex'));
  if (!ok) bad('E-mail ou senha incorretos.', 401);
  startSession(res, u.id);
  return { name: u.name, email: u.email };
});

route('POST', '/api/logout', ({ req, res }) => {
  const t = cookie(req, 'sid');
  if (t) q(`DELETE FROM sessions WHERE token=?`).run(t);
  res.setHeader('Set-Cookie', 'sid=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  return { ok: true };
});

route('GET', '/api/me', ({ user }) => ({ user: user ? { name: user.name, email: user.email } : null }));

// --- rifas do administrador
route('GET', '/api/raffles', ({ user }) => {
  return q(`SELECT * FROM raffles WHERE user_id=? ORDER BY created_at DESC`).all(user.id).map((r) => {
    const c = counts(r.id);
    const cover = q(`SELECT filename FROM photos WHERE raffle_id=? ORDER BY position LIMIT 1`).get(r.id);
    return {
      id: r.id, slug: r.slug, title: r.title, total_numbers: r.total_numbers, price_cents: r.price_cents,
      status: r.status, draw_date: r.draw_date, winner_number: r.winner_number,
      paid: c.paid, pending: c.pending, cover: cover ? `/uploads/${cover.filename}` : null,
    };
  });
}, { auth: true });

route('POST', '/api/raffles', ({ user, body }) => {
  const f = raffleFields(body);
  const photos = Array.isArray(body.photos) ? body.photos : [];
  if (photos.length > MAX_PHOTOS) bad(`Envie no máximo ${MAX_PHOTOS} fotos.`);
  const files = photos.map((p) => savePhoto(p.data));
  const slug = crypto.randomBytes(5).toString('hex');
  const id = tx(() => {
    const r = q(`INSERT INTO raffles (slug,user_id,title,description,total_numbers,price_cents,pix_key,whatsapp,
        reserve_minutes,max_per_buyer,draw_date,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(slug, user.id, f.title, f.description, f.total_numbers, f.price_cents, f.pix_key, f.whatsapp,
        f.reserve_minutes, f.max_per_buyer, f.draw_date, Date.now());
    const rid = Number(r.lastInsertRowid);
    files.forEach((fn, i) => q(`INSERT INTO photos (raffle_id,filename,position) VALUES (?,?,?)`).run(rid, fn, i));
    return rid;
  });
  return { id, slug };
}, { auth: true });

function ownRaffle(user, id) {
  const r = q(`SELECT * FROM raffles WHERE id=? AND user_id=?`).get(Number(id), user.id);
  if (!r) bad('Rifa não encontrada.', 404);
  return r;
}

route('GET', '/api/raffles/:id', ({ user, params }) => {
  const r = ownRaffle(user, params.id);
  const c = counts(r.id);
  const orders = q(`SELECT id, buyer_name, buyer_phone, numbers, status, created_at, expires_at, paid_at
      FROM orders WHERE raffle_id=? AND status IN ('pending','paid')
      ORDER BY status='pending' DESC, created_at DESC`).all(r.id)
    .map((o) => ({ ...o, numbers: JSON.parse(o.numbers) }));
  const taken = q(`SELECT t.number, o.status FROM tickets t JOIN orders o ON o.id=t.order_id WHERE t.raffle_id=?`)
    .all(r.id).map((t) => [t.number, t.status === 'paid' ? 'p' : 'r']);
  return {
    raffle: {
      id: r.id, slug: r.slug, title: r.title, description: r.description, total_numbers: r.total_numbers,
      price_cents: r.price_cents, pix_key: r.pix_key, whatsapp: r.whatsapp, reserve_minutes: r.reserve_minutes,
      max_per_buyer: r.max_per_buyer, draw_date: r.draw_date, status: r.status,
    },
    photos: photosOf(r.id), orders, taken, counts: c, can_draw: canDraw(r, c), winner: winnerOf(r),
  };
}, { auth: true });

route('PUT', '/api/raffles/:id', ({ user, params, body }) => {
  const r = ownRaffle(user, params.id);
  if (r.status !== 'open') bad('Esta rifa já foi sorteada e não pode mais ser alterada.');
  const c = counts(r.id);
  const locked = c.paid + c.pending > 0; // com números reservados/vendidos, quantidade e valor não mudam
  const f = raffleFields(body, { locked });
  const incoming = Array.isArray(body.photos) ? body.photos : [];
  if (incoming.length > MAX_PHOTOS) bad(`Envie no máximo ${MAX_PHOTOS} fotos.`);
  const current = q(`SELECT id, filename FROM photos WHERE raffle_id=?`).all(r.id);
  const byId = new Map(current.map((p) => [p.id, p.filename]));
  const finalFiles = incoming.map((p) => {
    if (p.id != null) {
      const fn = byId.get(Number(p.id));
      if (!fn) bad('Foto não encontrada.');
      return fn;
    }
    return savePhoto(p.data);
  });
  tx(() => {
    q(`UPDATE raffles SET title=?, description=?, pix_key=?, whatsapp=?, reserve_minutes=?, max_per_buyer=?,
        draw_date=?, total_numbers=?, price_cents=? WHERE id=?`)
      .run(f.title, f.description, f.pix_key, f.whatsapp, f.reserve_minutes, f.max_per_buyer, f.draw_date,
        locked ? r.total_numbers : f.total_numbers, locked ? r.price_cents : f.price_cents, r.id);
    q(`DELETE FROM photos WHERE raffle_id=?`).run(r.id);
    finalFiles.forEach((fn, i) => q(`INSERT INTO photos (raffle_id,filename,position) VALUES (?,?,?)`).run(r.id, fn, i));
  });
  current.filter((p) => !finalFiles.includes(p.filename)).forEach((p) => removePhotoFile(p.filename));
  return { ok: true };
}, { auth: true });

route('DELETE', '/api/raffles/:id', ({ user, params }) => {
  const r = ownRaffle(user, params.id);
  if (counts(r.id).paid > 0) bad('Esta rifa já tem números pagos e não pode ser excluída.');
  const files = q(`SELECT filename FROM photos WHERE raffle_id=?`).all(r.id);
  q(`DELETE FROM raffles WHERE id=?`).run(r.id);
  files.forEach((p) => removePhotoFile(p.filename));
  return { ok: true };
}, { auth: true });

route('POST', '/api/raffles/:id/draw', ({ user, params }) => {
  const r = ownRaffle(user, params.id);
  const c = counts(r.id);
  if (r.status !== 'open') bad('Esta rifa já foi sorteada.');
  if (c.paid === 0) bad('Ainda não há números pagos para sortear.');
  if (!canDraw(r, c)) bad('O sorteio só pode ser feito com a rifa completa ou a partir da data do sorteio.');
  tx(() => {
    const paid = q(`SELECT t.number FROM tickets t JOIN orders o ON o.id=t.order_id
                    WHERE t.raffle_id=? AND o.status='paid' ORDER BY t.number`).all(r.id);
    const winner = paid[crypto.randomInt(paid.length)].number; // aleatório criptograficamente seguro
    // Reservas ainda pendentes ficam de fora e são canceladas.
    const pend = q(`SELECT id FROM orders WHERE raffle_id=? AND status='pending'`).all(r.id);
    for (const o of pend) {
      q(`DELETE FROM tickets WHERE order_id=?`).run(o.id);
      q(`UPDATE orders SET status='cancelled' WHERE id=?`).run(o.id);
    }
    q(`UPDATE raffles SET status='drawn', winner_number=?, drawn_at=? WHERE id=?`).run(winner, Date.now(), r.id);
  });
  return { winner: winnerOf(q(`SELECT * FROM raffles WHERE id=?`).get(r.id)) };
}, { auth: true });

// --- pedidos (ações do administrador)
function ownOrder(user, id) {
  const o = q(`SELECT o.*, r.status AS raffle_status FROM orders o JOIN raffles r ON r.id=o.raffle_id
               WHERE o.id=? AND r.user_id=?`).get(Number(id), user.id);
  if (!o) bad('Pedido não encontrado.', 404);
  if (o.raffle_status !== 'open') bad('Esta rifa já foi sorteada.');
  return o;
}
route('POST', '/api/orders/:id/approve', ({ user, params }) => {
  const o = ownOrder(user, params.id);
  if (o.status !== 'pending') bad('Esta reserva expirou ou já foi tratada. Atualize a página.');
  q(`UPDATE orders SET status='paid', paid_at=? WHERE id=?`).run(Date.now(), o.id);
  return { ok: true };
}, { auth: true });

route('POST', '/api/orders/:id/cancel', ({ user, params }) => {
  const o = ownOrder(user, params.id);
  if (o.status !== 'pending' && o.status !== 'paid') bad('Este pedido já não está ativo.');
  tx(() => {
    q(`DELETE FROM tickets WHERE order_id=?`).run(o.id);
    q(`UPDATE orders SET status='cancelled' WHERE id=?`).run(o.id);
  });
  return { ok: true };
}, { auth: true });

// --- página pública da rifa
function publicRaffle(slug) {
  const r = q(`SELECT * FROM raffles WHERE slug=?`).get(slug);
  if (!r) bad('Rifa não encontrada.', 404);
  return r;
}

route('GET', '/api/r/:slug', ({ params }) => {
  const r = publicRaffle(params.slug);
  const taken = q(`SELECT t.number, o.status, o.buyer_name FROM tickets t JOIN orders o ON o.id=t.order_id
                   WHERE t.raffle_id=? ORDER BY t.number`).all(r.id)
    .map((t) => [t.number, t.status === 'paid' ? 'p' : 'r', shortName(t.buyer_name)]);
  const w = winnerOf(r);
  return {
    raffle: {
      slug: r.slug, title: r.title, description: r.description, total_numbers: r.total_numbers,
      price_cents: r.price_cents, pix_key: r.pix_key, whatsapp: r.whatsapp,
      reserve_minutes: r.reserve_minutes, max_per_buyer: r.max_per_buyer, draw_date: r.draw_date, status: r.status,
    },
    photos: photosOf(r.id).map((p) => p.url), taken,
    winner: w ? { number: w.number, name: shortName(w.name) } : null,
  };
});

route('POST', '/api/r/:slug/reserve', ({ params, body }) => {
  const r = publicRaffle(params.slug);
  if (r.status !== 'open') bad('Esta rifa já foi encerrada.');
  const name = str(body.name, 80, 'Nome');
  const tel = phone(body.phone, 'WhatsApp');
  if (!Array.isArray(body.numbers) || body.numbers.length === 0) bad('Escolha pelo menos um número.');
  const numbers = [...new Set(body.numbers.map((n) => intIn(n, 1, r.total_numbers, 'Número')))].sort((a, b) => a - b);

  return tx(() => {
    if (r.max_per_buyer != null) {
      const have = q(`SELECT COUNT(*) AS n FROM tickets t JOIN orders o ON o.id=t.order_id
                      WHERE t.raffle_id=? AND o.buyer_phone=?`).get(r.id, tel).n;
      if (have + numbers.length > r.max_per_buyer) {
        bad(`Esta rifa permite no máximo ${r.max_per_buyer} número(s) por pessoa` +
          (have ? ` e você já tem ${have}.` : '.'));
      }
    }
    const busy = numbers.filter((n) => q(`SELECT 1 FROM tickets WHERE raffle_id=? AND number=?`).get(r.id, n));
    if (busy.length) {
      throw Object.assign(new HttpError(409,
        `Os números ${busy.join(', ')} acabaram de ser reservados por outra pessoa. Escolha outros.`), { busy });
    }
    const token = crypto.randomBytes(16).toString('hex');
    const now = Date.now();
    const o = q(`INSERT INTO orders (raffle_id,token,buyer_name,buyer_phone,numbers,created_at,expires_at)
                 VALUES (?,?,?,?,?,?,?)`)
      .run(r.id, token, name, tel, JSON.stringify(numbers), now, now + r.reserve_minutes * 60_000);
    const oid = Number(o.lastInsertRowid);
    for (const n of numbers) q(`INSERT INTO tickets (raffle_id,number,order_id) VALUES (?,?,?)`).run(r.id, n, oid);
    return { token };
  });
});

route('GET', '/api/pedido/:token', ({ params }) => {
  const o = q(`SELECT * FROM orders WHERE token=?`).get(params.token);
  if (!o) bad('Pedido não encontrado.', 404);
  const r = q(`SELECT price_cents FROM raffles WHERE id=?`).get(o.raffle_id);
  const numbers = JSON.parse(o.numbers);
  return {
    token: o.token, status: o.status, buyer_name: o.buyer_name, numbers,
    total_cents: numbers.length * r.price_cents, expires_at: o.expires_at,
  };
});

// ---------------------------------------------------------------- servidor HTTP
function cookie(req, name) {
  const m = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(req.headers.cookie || '');
  return m ? m[1] : null;
}
function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  q(`INSERT INTO sessions (token,user_id,created_at) VALUES (?,?,?)`).run(token, userId, Date.now());
  res.setHeader('Set-Cookie', `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`);
}
function currentUser(req) {
  const t = cookie(req, 'sid');
  if (!t) return null;
  return q(`SELECT u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?`).get(t) || null;
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, 'Envio grande demais. Use fotos menores.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new HttpError(400, 'Requisição inválida.')); }
    });
    req.on('error', reject);
  });
}
const json = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
function sendFile(res, base, rel, cache) {
  const file = path.join(base, rel);
  if (!file.startsWith(base + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Página não encontrada.'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': cache, 'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
}
const PAGES = { '/': 'index.html', '/painel': 'painel.html', '/gerenciar': 'gerenciar.html' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end(); }

  if (pathname.startsWith('/api/')) {
    try {
      const r = routes.find((x) => x.method === req.method && x.re.test(pathname));
      if (!r) bad('Rota não encontrada.', 404);
      const m = r.re.exec(pathname);
      const params = Object.fromEntries(r.keys.map((k, i) => [k, m[i + 1]]));
      const user = currentUser(req);
      if (r.auth && !user) bad('Entre na sua conta para continuar.', 401);
      const body = req.method === 'GET' ? {} : await readBody(req);
      if (body === null || typeof body !== 'object') bad('Requisição inválida.');
      expireOrders();
      json(res, 200, r.handler({ req, res, params, body, user }));
    } catch (e) {
      if (e instanceof HttpError) return json(res, e.status, { error: e.message, busy: e.busy });
      console.error(e);
      json(res, 500, { error: 'Erro interno. Tente novamente.' });
    }
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  if (pathname.startsWith('/uploads/')) return sendFile(res, UPLOAD_DIR, path.basename(pathname), 'public, max-age=31536000, immutable');
  if (PAGES[pathname]) return sendFile(res, PUBLIC_DIR, PAGES[pathname], 'no-cache');
  if (/^\/r\/[a-z0-9]+$/.test(pathname)) return sendFile(res, PUBLIC_DIR, 'rifa.html', 'no-cache');
  sendFile(res, PUBLIC_DIR, pathname.slice(1), 'no-cache');
});

server.listen(PORT, () => console.log(`Sistema de rifas rodando em http://localhost:${PORT}`));
