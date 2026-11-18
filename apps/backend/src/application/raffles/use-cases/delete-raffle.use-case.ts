import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../domain/errors/domain.errors.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { OK, type OkDto } from '../../common/dto/ok.dto.js';
import type { OwnedRaffleRefDto } from '../dto/raffle.dto.js';
import { requireOwnedRaffle } from '../raffle.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { PhotoStorage } from '../../../domain/repositories/photo-storage.js';
import type { IPhotoStorage } from '../../../domain/repositories/interfaces/photo-storage.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class DeleteRaffleUseCase implements UseCase<OwnedRaffleRefDto, OkDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(PhotoStorage) private readonly storage: IPhotoStorage,
  ) {}

  async execute({ userId, raffleId }: OwnedRaffleRefDto): Promise<OkDto> {
    const raffle = await requireOwnedRaffle(this.raffles, userId, raffleId);
    if ((await this.orders.countNumbers(raffle.id)).paid > 0) {
      throw new BusinessRuleError('Esta rifa já tem números pagos e não pode ser excluída.');
    }
    const files = await this.photos.listByRaffle(raffle.id);
    await this.raffles.delete(raffle.id);
    await Promise.all(files.map((p) => this.storage.remove(p.filename)));
    return OK;
  }
}
