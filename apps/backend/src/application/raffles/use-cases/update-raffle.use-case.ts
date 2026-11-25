import { Inject, Injectable } from '@nestjs/common';
import { assertOpen, isPricingLocked } from '../../../domain/rules/raffle.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { OK, type OkDto } from '../../common/dto/ok.dto.js';
import type { UpdateRaffleInputDto } from '../dto/raffle.dto.js';
import {
  assertPhotoCount, requireOwnedRaffle, resolvePhotoFiles, toRaffleDetails,
} from '../raffle.helpers.js';
import { OrderRepository } from '../../../domain/repositories/order.repository.js';
import type { IOrderRepository } from '../../../domain/repositories/interfaces/order.repository.interface.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { PhotoStorage } from '../../../domain/repositories/photo-storage.js';
import type { IPhotoStorage } from '../../../domain/repositories/interfaces/photo-storage.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class UpdateRaffleUseCase implements UseCase<UpdateRaffleInputDto, OkDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(OrderRepository) private readonly orders: IOrderRepository,
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(PhotoStorage) private readonly storage: IPhotoStorage,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute({ userId, raffleId, data }: UpdateRaffleInputDto): Promise<OkDto> {
    const raffle = await requireOwnedRaffle(this.raffles, userId, raffleId);
    assertOpen(raffle, 'Esta rifa já foi sorteada e não pode mais ser alterada.');

    const locked = isPricingLocked(await this.orders.countNumbers(raffle.id));
    const details = toRaffleDetails(data, locked ? raffle : undefined, raffle);
    assertPhotoCount(data.photos);

    const current = await this.photos.listByRaffle(raffle.id);
    const files = await resolvePhotoFiles(data.photos, this.storage, details.visibility, current);

    await this.unitOfWork.run(async () => {
      await this.raffles.update(raffle.id, details);
      await this.photos.replaceAll(raffle.id, files);
    });

    if (raffle.visibility !== details.visibility) await this.storage.setVisibility(files, details.visibility);

    const removed = current.filter((p) => !files.includes(p.filename));
    await Promise.all(removed.map((p) => this.storage.remove(p.filename)));
    return OK;
  }
}
