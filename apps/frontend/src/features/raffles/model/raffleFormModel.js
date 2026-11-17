// Conversão entre a rifa da API e os campos do formulário de criar/editar.
import {
  centsToInput, formatPhone, fromDateTimeInput, parseMoney, toDateTimeInput,
} from '../../../shared/lib/format';

export const MAX_PHOTOS = 8;
export const RESERVE_UNITS = { min: 1, h: 60, d: 1440 };
const DEFAULT_RESERVE_MINUTES = 120;
const DEFAULT_TOTAL_NUMBERS = 100;

function reserveUnitOf(minutes) {
  if (minutes % RESERVE_UNITS.d === 0) return 'd';
  if (minutes % RESERVE_UNITS.h === 0) return 'h';
  return 'min';
}

export function toFormValues(raffle = {}) {
  const minutes = raffle.reserve_minutes ?? DEFAULT_RESERVE_MINUTES;
  const unit = reserveUnitOf(minutes);
  return {
    title: raffle.title ?? '',
    description: raffle.description ?? '',
    total_numbers: String(raffle.total_numbers ?? DEFAULT_TOTAL_NUMBERS),
    price: centsToInput(raffle.price_cents),
    pix_key: raffle.pix_key ?? '',
    whatsapp: raffle.whatsapp ? formatPhone(raffle.whatsapp) : '',
    reserve_value: String(minutes / RESERVE_UNITS[unit]),
    reserve_unit: unit,
    max_per_buyer: raffle.max_per_buyer != null ? String(raffle.max_per_buyer) : '',
    draw_date: toDateTimeInput(raffle.draw_date),
  };
}

/** Fotos já salvas vão só com `id`; novas vão com o `data` (data URL). */
const toPhotoPayload = (photos) => photos.map((p) => (p.id != null ? { id: p.id } : { data: p.data }));

/** Monta o corpo da requisição. Lança Error com mensagem amigável se algo estiver inválido. */
export function toPayload(values, photos, { locked = false } = {}) {
  const priceCents = parseMoney(values.price);
  if (!locked && !(priceCents > 0)) throw new Error('Informe o valor de cada número, por exemplo 10,00.');
  return {
    title: values.title,
    description: values.description,
    total_numbers: Number(values.total_numbers),
    price_cents: priceCents,
    pix_key: values.pix_key,
    whatsapp: values.whatsapp,
    reserve_minutes: Math.round(Number(values.reserve_value) * RESERVE_UNITS[values.reserve_unit]),
    max_per_buyer: values.max_per_buyer === '' ? null : Number(values.max_per_buyer),
    draw_date: fromDateTimeInput(values.draw_date),
    photos: toPhotoPayload(photos),
  };
}

/** Corpo para salvar só uma mudança pontual (ex.: data do sorteio), mantendo o resto como está. */
export function toPartialPayload(raffle, photos, changes) {
  return { ...raffle, photos: toPhotoPayload(photos), ...changes };
}
