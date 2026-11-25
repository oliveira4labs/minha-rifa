import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/domain.errors.js';
import { canView } from '../../../domain/rules/raffle.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { GetPublicRaffleInput, PublicRaffleDto } from '../dto/public-raffle.dto.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { PhotoStorage } from '../../../domain/repositories/photo-storage.js';
import type { IPhotoStorage } from '../../../domain/repositories/interfaces/photo-storage.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class GetPublicRaffleUseCase implements UseCase<GetPublicRaffleInput, PublicRaffleDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(PhotoStorage) private readonly storage: IPhotoStorage,
  ) {}

  async execute({ slug, viewerId }: GetPublicRaffleInput): Promise<PublicRaffleDto> {
    const r = await this.raffles.findBySlug(slug);
    if (!r || !canView(r, viewerId)) throw new NotFoundError('Rifa não encontrada.');
    const [taken, photos] = await Promise.all([this.orders.listTakenNumbers(r.id), this.photos.listByRaffle(r.id)]);

    return {
      raffle: {
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
      photos: photos.map((p) => this.storage.url(p.filename, r.visibility)),
      taken: taken.map((t) => [t.number, t.status === 'paid' ? 'p' : 'r']),
      winner: r.status === 'drawn' && r.winnerNumber != null ? { number: r.winnerNumber } : null,
    };
  }
}
