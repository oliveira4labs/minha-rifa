export const formatMoney = (cents) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const padNumber = (n, total) => String(n).padStart(String(total).length, '0');

export const padNumbers = (list, total) => list.map((n) => padNumber(n, total));

export const formatDate = (ms) =>
  new Date(ms).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export function formatPhone(digits) {
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return digits;
}

export function formatDuration(minutes) {
  if (minutes % 1440 === 0) return `${minutes / 1440} dia${minutes === 1440 ? '' : 's'}`;
  if (minutes % 60 === 0) return `${minutes / 60} hora${minutes === 60 ? '' : 's'}`;
  return `${minutes} minutos`;
}

export function formatCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h >= 48) return `${Math.floor(h / 24)} dias`;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
  return `${m}min ${String(sec).padStart(2, '0')}s`;
}

export function parseMoney(text) {
  const clean = String(text)
    .replace(/[^\d,.]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const v = Math.round(parseFloat(clean) * 100);
  return Number.isFinite(v) ? v : NaN;
}

export const centsToInput = (cents) => (cents != null ? (cents / 100).toFixed(2).replace('.', ',') : '');

export function toDateTimeInput(ms) {
  if (ms == null) return '';
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export const fromDateTimeInput = (value) => (value ? new Date(value).getTime() : null);
