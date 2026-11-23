import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/domain.errors.js';
import { isPhotoFilename } from '../../../domain/rules/photo.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { AuthorizePrivatePhotoInput, PrivatePhotoDto } from '../dto/photo.dto.js';
import { PhotoRepository } from '../../../domain/repositories/photo.repository.js';
import type { IPhotoRepository } from '../../../domain/repositories/interfaces/photo.repository.interface.js';
import { RaffleRepository } from '../../../domain/repositories/raffle.repository.js';
import type { IRaffleRepository } from '../../../domain/repositories/interfaces/raffle.repository.interface.js';

@Injectable()
export class AuthorizePrivatePhotoUseCase implements UseCase<AuthorizePrivatePhotoInput, PrivatePhotoDto> {
  constructor(
    @Inject(PhotoRepository) private readonly photos: IPhotoRepository,
    @Inject(RaffleRepository) private readonly raffles: IRaffleRepository,
  ) {}

  async execute({ userId, filename }: AuthorizePrivatePhotoInput): Promise<PrivatePhotoDto> {
    const notFound = new NotFoundError('Foto não encontrada.');
    if (userId == null || !isPhotoFilename(filename)) throw notFound;

    const photo = await this.photos.findByFilename(filename);
    if (!photo) throw notFound;

    const raffle = await this.raffles.findByIdAndOwner(photo.raffleId, userId);
    if (!raffle || raffle.visibility !== 'private') throw notFound;

    return { filename: photo.filename };
  }
}
