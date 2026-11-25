import type { NumberCounts, Raffle, RaffleVisibility } from '../interfaces/raffle.interface.js';
import { BusinessRuleError } from '../errors/domain.errors.js';

export const MAX_NUMBERS = 5000;
// Curtos de propósito: o título e a descrição aparecem na página pública e na mensagem de divulgação.
export const MAX_TITLE_LENGTH = 60;
export const MAX_DESCRIPTION_LENGTH = 500;
// Limites antigos, mantidos só como teto do DTO: rifas criadas antes da redução podem ter textos até aqui
// e precisam continuar editáveis (ex.: adiar a data do sorteio reenvia o título e a descrição como estão).
export const LEGACY_MAX_TITLE_LENGTH = 120;
export const LEGACY_MAX_DESCRIPTION_LENGTH = 5000;

/** Texto novo ou alterado precisa caber em `max`; o texto que já estava salvo (`current`) passa como está. */
export function assertTextLimit(value: string, max: number, label: string, current?: string): string {
  if (value.length > max && value !== current) throw new BusinessRuleError(`O campo "${label}" é muito longo (máximo ${max} caracteres).`);
  return value;
}
export const MAX_PHOTOS = 8;
export const MAX_PRICE_CENTS = 100_000_00;
export const RAFFLE_VISIBILITIES: readonly RaffleVisibility[] = ['public', 'private'];

export const canView = (raffle: Raffle, viewerId: number | null): boolean =>
  raffle.visibility === 'public' || raffle.userId === viewerId;

export function assertIntInRange(value: unknown, min: number, max: number, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new BusinessRuleError(`"${label}" deve ser um número entre ${min} e ${max}.`);
  }
  return n;
}

export const isPricingLocked = (counts: NumberCounts): boolean => counts.paid + counts.pending > 0;

export function assertOpen(raffle: Raffle, message = 'Esta rifa já foi sorteada.'): void {
  if (raffle.status !== 'open') throw new BusinessRuleError(message);
}

export function canDraw(raffle: Raffle, counts: NumberCounts, now = Date.now()): boolean {
  if (raffle.status !== 'open' || counts.paid === 0) return false;
  if (counts.paid === raffle.totalNumbers) return true;
  return raffle.drawDate != null && now >= raffle.drawDate;
}
