import type { NumberCounts, Raffle, RaffleVisibility } from '../interfaces/raffle.interface.js';
import { BusinessRuleError } from '../errors/domain.errors.js';

export const MAX_NUMBERS = 5000;
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
