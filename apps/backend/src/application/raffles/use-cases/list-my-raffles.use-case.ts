import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { RaffleSummaryDto } from '../dto/raffle.dto.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { PhotoStorage } from '../../../domain/repositories/photo-storage.js';
import type { IPhotoStorage } from '../../../domain/repositories/interfaces/photo-storage.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class ListMyRafflesUseCase implements UseCase<number, RaffleSummaryDto[]> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(PhotoStorage) private readonly storage: IPhotoStorage,
  ) {}

  async execute(userId: number): Promise<RaffleSummaryDto[]> {
    const list = await this.raffles.listByOwner(userId);
    return Promise.all(list.map(async (r) => {
      const counts = await this.orders.countNumbers(r.id);
      const [cover] = await this.photos.listByRaffle(r.id);
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        total_numbers: r.totalNumbers,
        price_cents: r.priceCents,
        status: r.status,
        visibility: r.visibility,
        draw_date: r.drawDate,
        winner_number: r.winnerNumber,
        paid: counts.paid,
        pending: counts.pending,
        awaiting: counts.awaiting,
        cover: cover ? this.storage.url(cover.filename, r.visibility) : null,
      };
    }));
  }
}
