import { Inject, Injectable } from '@nestjs/common';
import { canDraw } from '../../../domain/rules/raffle.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { OwnedRaffleRefDto, RaffleDetailsDto } from '../dto/raffle.dto.js';
import { findWinner, requireOwnedRaffle } from '../raffle.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { PhotoStorage } from '../../../domain/repositories/photo-storage.js';
import type { IPhotoStorage } from '../../../domain/repositories/interfaces/photo-storage.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class GetRaffleDetailsUseCase implements UseCase<OwnedRaffleRefDto, RaffleDetailsDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(PhotoStorage) private readonly storage: IPhotoStorage,
  ) {}

  async execute({ userId, raffleId }: OwnedRaffleRefDto): Promise<RaffleDetailsDto> {
    const r = await requireOwnedRaffle(this.raffles, userId, raffleId);
    const [counts, orders, taken, photos] = await Promise.all([
      this.orders.countNumbers(r.id),
      this.orders.listManageableByRaffle(r.id),
      this.orders.listTakenNumbers(r.id),
      this.photos.listByRaffle(r.id),
    ]);

    return {
      raffle: {
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        total_numbers: r.totalNumbers,
        price_cents: r.priceCents,
        pix_key: r.pixKey,
        whatsapp: r.whatsapp,
        reserve_minutes: r.reserveMinutes,
        max_per_buyer: r.maxPerBuyer,
        draw_date: r.drawDate,
        status: r.status,
        visibility: r.visibility,
      },
      photos: photos.map((p) => ({ id: p.id, url: this.storage.url(p.filename, r.visibility) })),
      orders: orders.map((o) => ({
        id: o.id,
        buyer_name: o.buyerName,
        buyer_phone: o.buyerPhone,
        numbers: o.numbers,
        status: o.status,
        created_at: o.createdAt,
        expires_at: o.expiresAt,
        proof_sent_at: o.proofSentAt,
        paid_at: o.paidAt,
      })),
      taken: taken.map((t) => [t.number, t.status === 'paid' ? 'p' : 'r']),
      counts,
      can_draw: canDraw(r, counts),
      winner: findWinner(r, taken),
    };
  }
}
