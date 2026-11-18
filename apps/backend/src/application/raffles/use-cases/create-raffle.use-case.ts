import { Inject, Injectable } from '@nestjs/common';
import { newRaffleSlug } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { CreatedRaffleDto, CreateRaffleInputDto } from '../dto/raffle.dto.js';
import { assertPhotoCount, resolvePhotoFiles, toRaffleDetails } from '../raffle.helpers.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { PhotoStorage } from '../../../domain/repositories/photo-storage.js';
import type { IPhotoStorage } from '../../../domain/repositories/interfaces/photo-storage.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';
import { UnitOfWork } from '../../../domain/repositories/unit-of-work.js';
import type { IUnitOfWork } from '../../../domain/repositories/interfaces/unit-of-work.interface.js';

@Injectable()
export class CreateRaffleUseCase implements UseCase<CreateRaffleInputDto, CreatedRaffleDto> {
  constructor(
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(PhotoStorage) private readonly storage: IPhotoStorage,
    @Inject(UnitOfWork) private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute({ userId, data }: CreateRaffleInputDto): Promise<CreatedRaffleDto> {
    const details = toRaffleDetails(data);
    assertPhotoCount(data.photos);
    const files = await resolvePhotoFiles(data.photos, this.storage);
    const slug = newRaffleSlug();

    const id = await this.unitOfWork.run(async () => {
      const raffleId = await this.raffles.create({ ...details, slug, userId, createdAt: Date.now() });
      await this.photos.replaceAll(raffleId, files);
      return raffleId;
    });
    return { id, slug };
  }
}
