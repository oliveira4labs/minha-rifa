import { fromDateTimeInput, parseMoney, toDateTimeInput } from '../../../shared/lib/format';
import { formatMoneyInput, maskPhone } from '../../../shared/lib/masks';

export const MAX_PHOTOS = 8;
// Iguais aos do backend (domain/rules/raffle.rules.ts).
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 500;
export const RESERVE_UNITS = { min: 1, h: 60, d: 1440 };
const DEFAULT_RESERVE_MINUTES = 30;
const DEFAULT_TOTAL_NUMBERS = 100;

export function toFormValues(raffle = {}) {
  return {
    title: raffle.title ?? '',
    description: raffle.description ?? '',
    total_numbers: String(raffle.total_numbers ?? DEFAULT_TOTAL_NUMBERS),
    price: raffle.price_cents != null ? formatMoneyInput(raffle.price_cents) : '',
    pix_key: raffle.pix_key ?? '',
    whatsapp: maskPhone(raffle.whatsapp),
    // Sempre em minutos, na criação e na edição; o admin pode trocar para horas ou dias
    reserve_value: String(raffle.reserve_minutes ?? DEFAULT_RESERVE_MINUTES),
    reserve_unit: 'min',
    max_per_buyer: raffle.max_per_buyer != null ? String(raffle.max_per_buyer) : '',
    draw_date: toDateTimeInput(raffle.draw_date),
    visibility: raffle.visibility ?? 'public',
  };
}

const toPhotoPayload = (photos) => photos.map((p) => (p.id != null ? { id: p.id } : { data: p.data }));

export function toPayload(values, photos, { locked = false } = {}) {
  const priceCents = parseMoney(values.price);
  if (!locked && !(priceCents > 0)) throw new Error('Informe o valor de cada número, por exemplo R$ 10,00.');
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
    visibility: values.visibility,
    photos: toPhotoPayload(photos),
  };
}

export function toPartialPayload(raffle, photos, changes) {
  return { ...raffle, photos: toPhotoPayload(photos), ...changes };
}
