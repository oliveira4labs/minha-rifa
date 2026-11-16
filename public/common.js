// Funções compartilhadas entre as páginas.
const $ = (sel, el = document) => el.querySelector(sel);

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* resposta vazia */ }
  if (!res.ok) {
    const err = new Error(data.error || 'Não foi possível concluir. Tente novamente.');
    err.status = res.status; err.busy = data.busy;
    throw err;
  }
  return data;
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (cents) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const pad = (n, total) => String(n).padStart(String(total).length, '0');
const fmtDate = (ms) => new Date(ms).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtPhone = (d) => d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d;
const waLink = (phone, text) => `https://wa.me/${phone.length <= 11 ? '55' + phone : phone}${text ? '?text=' + encodeURIComponent(text) : ''}`;

function toLocalInput(ms) {
  if (ms == null) return '';
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}
function parseMoney(text) {
  const clean = String(text).replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const v = Math.round(parseFloat(clean) * 100);
  return Number.isFinite(v) ? v : NaN;
}
function fmtDuration(minutes) {
  if (minutes % 1440 === 0) return `${minutes / 1440} dia${minutes === 1440 ? '' : 's'}`;
  if (minutes % 60 === 0) return `${minutes / 60} hora${minutes === 60 ? '' : 's'}`;
  return `${minutes} minutos`;
}
function countdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h >= 48) return `${Math.floor(h / 24)} dias`;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${m}min ${String(sec).padStart(2, '0')}s`;
}

let toastTimer;
function toast(msg, isError) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' err' : '');
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), isError ? 6000 : 3000);
}

async function copyText(text, okMsg = 'Copiado!') {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  toast(okMsg);
}

// Diálogo de confirmação. Retorna true se a pessoa confirmar.
function confirmDialog({ title, text, ok = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.innerHTML = `<h2>${esc(title)}</h2><p class="muted" style="margin-top:8px;white-space:pre-line">${esc(text)}</p>
      <div class="actions"><button class="btn" value="no">Voltar</button>
      <button class="btn ${danger ? 'danger solid' : 'primary'}" value="yes">${esc(ok)}</button></div>`;
    d.addEventListener('click', (e) => { if (e.target.value) d.close(e.target.value); });
    d.addEventListener('close', () => { d.remove(); resolve(d.returnValue === 'yes'); });
    document.body.append(d);
    d.showModal();
  });
}

// Reduz a foto no navegador antes de enviar (máx. 1400px, JPEG).
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1400 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Não foi possível ler esta imagem.')); };
    img.src = url;
  });
}

// ---------------------------------------------------------------- formulário de rifa (criar/editar)
const RESERVE_UNITS = { min: 1, h: 60, d: 1440 };

function raffleFormHtml(r = {}, locked = false) {
  const mins = r.reserve_minutes ?? 120;
  const unit = mins % 1440 === 0 ? 'd' : mins % 60 === 0 ? 'h' : 'min';
  return `
    <label>Título da rifa
      <input name="title" maxlength="120" required value="${esc(r.title ?? '')}" placeholder="Ex.: Rifa de uma bicicleta aro 29">
    </label>
    <label>Descrição <span class="hint">Conte o que é o prêmio, o estado, como será a entrega…</span>
      <textarea name="description" maxlength="5000">${esc(r.description ?? '')}</textarea>
    </label>
    <div class="stack-sm">
      <span style="font-weight:600;font-size:.92rem">Fotos <span class="hint muted" style="font-weight:400">até 8 — a primeira é a capa</span></span>
      <div class="thumbs" data-photos></div>
      <input type="file" accept="image/*" multiple class="hidden" data-file>
    </div>
    <div class="grid2">
      <label>Quantidade de números
        <input name="total_numbers" type="number" inputmode="numeric" min="2" max="5000" required value="${r.total_numbers ?? 100}" ${locked ? 'disabled' : ''}>
      </label>
      <label>Valor de cada número (R$)
        <input name="price" inputmode="decimal" required value="${r.price_cents != null ? (r.price_cents / 100).toFixed(2).replace('.', ',') : ''}" placeholder="10,00" ${locked ? 'disabled' : ''}>
      </label>
    </div>
    ${locked ? '<p class="small muted">Quantidade e valor não podem mudar porque já existem números reservados ou pagos.</p>' : ''}
    <div class="grid2">
      <label>Chave PIX para pagamento
        <input name="pix_key" maxlength="200" required value="${esc(r.pix_key ?? '')}" placeholder="CPF, celular, e-mail ou chave aleatória">
      </label>
      <label>Seu WhatsApp (com DDD) <span class="hint">Para onde os compradores enviam o comprovante</span>
        <input name="whatsapp" type="tel" inputmode="tel" required value="${esc(r.whatsapp ? fmtPhone(r.whatsapp) : '')}" placeholder="(11) 91234-5678">
      </label>
    </div>
    <div class="grid2">
      <label>Tempo de reserva <span class="hint">Sem confirmação nesse prazo, o número volta a ficar disponível</span>
        <span class="row" style="flex-wrap:nowrap">
          <input name="reserve_value" type="number" inputmode="numeric" min="1" required value="${mins / RESERVE_UNITS[unit]}">
          <select name="reserve_unit">
            <option value="min" ${unit === 'min' ? 'selected' : ''}>minutos</option>
            <option value="h" ${unit === 'h' ? 'selected' : ''}>horas</option>
            <option value="d" ${unit === 'd' ? 'selected' : ''}>dias</option>
          </select>
        </span>
      </label>
      <label>Limite de números por pessoa <span class="hint">Deixe vazio para não limitar</span>
        <input name="max_per_buyer" type="number" inputmode="numeric" min="1" value="${r.max_per_buyer ?? ''}" placeholder="Sem limite">
      </label>
    </div>
    <label>Data do sorteio <span class="hint">Opcional. Você pode alterar depois</span>
      <input name="draw_date" type="datetime-local" value="${toLocalInput(r.draw_date)}">
    </label>`;
}

// Liga o seletor de fotos do formulário. Retorna função que devolve a lista atual.
function bindPhotos(form, initial = []) {
  const photos = initial.map((p) => ({ id: p.id, url: p.url }));
  const box = $('[data-photos]', form), input = $('[data-file]', form);
  const render = () => {
    box.innerHTML = photos.map((p, i) => `<div class="thumb"><img src="${esc(p.url || p.data)}" alt="Foto ${i + 1}">
      <button type="button" data-rm="${i}" aria-label="Remover foto ${i + 1}">×</button></div>`).join('') +
      (photos.length < 8 ? '<button type="button" class="thumb add" data-add aria-label="Adicionar fotos">+</button>' : '');
  };
  box.addEventListener('click', (e) => {
    if (e.target.dataset.rm != null) { photos.splice(Number(e.target.dataset.rm), 1); render(); }
    else if (e.target.dataset.add != null) input.click();
  });
  input.addEventListener('change', async () => {
    for (const f of [...input.files]) {
      if (photos.length >= 8) { toast('Máximo de 8 fotos.', true); break; }
      try { photos.push({ data: await fileToDataUrl(f) }); } catch (e) { toast(e.message, true); }
    }
    input.value = ''; render();
  });
  render();
  return () => photos.map((p) => (p.id != null ? { id: p.id } : { data: p.data }));
}

function readRaffleForm(form, getPhotos) {
  const v = (n) => form.elements[n]?.value ?? '';
  const price = parseMoney(v('price'));
  if (!form.elements.price.disabled && !(price > 0)) throw new Error('Informe o valor de cada número, por exemplo 10,00.');
  const date = v('draw_date');
  return {
    title: v('title'), description: v('description'),
    total_numbers: Number(v('total_numbers')), price_cents: price,
    pix_key: v('pix_key'), whatsapp: v('whatsapp'),
    reserve_minutes: Math.round(Number(v('reserve_value')) * RESERVE_UNITS[v('reserve_unit')]),
    max_per_buyer: v('max_per_buyer') === '' ? null : Number(v('max_per_buyer')),
    draw_date: date ? new Date(date).getTime() : null,
    photos: getPhotos(),
  };
}

function topbar(user) {
  return `<header class="topbar"><div>
    <a class="brand" href="${user ? '/painel' : '/'}">minha<span>rifa</span></a>
    ${user ? `<div class="row"><span class="small muted">${esc(user.name)}</span><button class="btn sm" id="logout">Sair</button></div>` : ''}
  </div></header>`;
}
function bindLogout() {
  $('#logout')?.addEventListener('click', async () => { await api('POST', '/api/logout'); location.href = '/'; });
}
async function requireUser() {
  const { user } = await api('GET', '/api/me');
  if (!user) { location.href = '/'; throw new Error('redirect'); }
  return user;
}
