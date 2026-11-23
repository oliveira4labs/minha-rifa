import type { TakenNumber } from '../../domain/interfaces/order.interface.js';
import type {
  Photo, Raffle, RaffleDetails, RafflePricing, RaffleVisibility,
} from '../../domain/interfaces/raffle.interface.js';
import { BusinessRuleError, NotFoundError } from '../../domain/errors/domain.errors.js';
import { decodePhotoDataUrl } from '../../domain/rules/photo.rules.js';
import {
  assertIntInRange, MAX_NUMBERS, MAX_PHOTOS, MAX_PRICE_CENTS,
} from '../../domain/rules/raffle.rules.js';
import type { PhotoInputDto, RaffleInputDto, WinnerDto } from './dto/raffle.dto.js';
import type { IPhotoStorage } from '../../domain/repositories/interfaces/photo-storage.interface.js';
import type { IRaffleRepository } from '../../domain/repositories/interfaces/raffle.repository.interface.js';

export async function requireOwnedRaffle(raffles: IRaffleRepository, userId: number, raffleId: number): Promise<Raffle> {
  const raffle = await raffles.findByIdAndOwner(raffleId, userId);
  if (!raffle) throw new NotFoundError('Rifa não encontrada.');
  return raffle;
}

export function toRaffleDetails(input: RaffleInputDto, locked?: RafflePricing): RaffleDetails {
  return {
    title: input.title,
    description: input.description,
    pixKey: input.pix_key,
    whatsapp: input.whatsapp,
    reserveMinutes: input.reserve_minutes,
    maxPerBuyer: input.max_per_buyer,
    drawDate: input.draw_date,
    visibility: input.visibility,
    totalNumbers: locked?.totalNumbers ?? assertIntInRange(input.total_numbers, 2, MAX_NUMBERS, 'Quantidade de números'),
    priceCents: locked?.priceCents ?? assertIntInRange(input.price_cents, 1, MAX_PRICE_CENTS, 'Valor de cada número'),
  };
}

export function assertPhotoCount(photos: PhotoInputDto[]): void {
  if (photos.length > MAX_PHOTOS) throw new BusinessRuleError(`Envie no máximo ${MAX_PHOTOS} fotos.`);
}

export async function resolvePhotoFiles(
  inputs: PhotoInputDto[],
  storage: IPhotoStorage,
  visibility: RaffleVisibility,
  existing: Photo[] = [],
): Promise<string[]> {
  const byId = new Map(existing.map((p) => [p.id, p.filename]));
  const plan = inputs.map((p) => {
    if (p.id != null) {
      const filename = byId.get(Number(p.id));
      if (!filename) throw new BusinessRuleError('Foto não encontrada.');
      return { filename };
    }
    return { content: decodePhotoDataUrl(p.data) };
  });
  const files: string[] = [];
  for (const item of plan) {
    files.push(item.filename ?? await storage.save(item.content!.bytes, item.content!.extension, visibility));
  }
  return files;
}

export function findWinner(raffle: Raffle, taken: TakenNumber[]): WinnerDto | null {
  if (raffle.status !== 'drawn' || raffle.winnerNumber == null) return null;
  const owner = taken.find((t) => t.number === raffle.winnerNumber);
  return {
    number: raffle.winnerNumber,
    name: owner?.buyerName ?? '',
    phone: owner?.buyerPhone ?? '',
    drawn_at: raffle.drawnAt,
  };
}
