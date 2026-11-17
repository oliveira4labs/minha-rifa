// Regras puras da rifa (sem I/O).
import type { NumberCounts, Raffle } from '../interfaces/raffle.interface.js';
import { BusinessRuleError } from '../errors/domain.errors.js';

export const MAX_NUMBERS = 5000;
export const MAX_PHOTOS = 8;
export const MAX_PRICE_CENTS = 100_000_00;

/** Lança erro se `value` não for inteiro entre min e max. */
export function assertIntInRange(value: unknown, min: number, max: number, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new BusinessRuleError(`"${label}" deve ser um número entre ${min} e ${max}.`);
  }
  return n;
}

/** Quantidade e valor não mudam depois que alguém reservou ou pagou um número. */
export const isPricingLocked = (counts: NumberCounts): boolean => counts.paid + counts.pending > 0;

export function assertOpen(raffle: Raffle, message = 'Esta rifa já foi sorteada.'): void {
  if (raffle.status !== 'open') throw new BusinessRuleError(message);
}

/**
 * Sorteio liberado: rifa aberta, ao menos 1 número pago e
 * (todos pagos OU a data do sorteio já chegou).
 */
export function canDraw(raffle: Raffle, counts: NumberCounts, now = Date.now()): boolean {
  if (raffle.status !== 'open' || counts.paid === 0) return false;
  if (counts.paid === raffle.totalNumbers) return true;
  return raffle.drawDate != null && now >= raffle.drawDate;
}

/** "Maria da Silva" → "Maria S." (o que aparece na página pública). */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}
