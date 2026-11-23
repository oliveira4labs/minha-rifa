import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { PublicConfigDto } from '../dto/remote-config.dto.js';
import { RemoteConfigRepository } from '../../../domain/repositories/remote-config.repository.js';
import type { IRemoteConfigRepository } from '../../../domain/repositories/interfaces/remote-config.repository.interface.js';

@Injectable()
export class GetPublicConfigUseCase implements UseCase<void, PublicConfigDto> {
  constructor(@Inject(RemoteConfigRepository) private readonly config: IRemoteConfigRepository) {}

  async execute(): Promise<PublicConfigDto> {
    const entries = await this.config.listPublic();
    return Object.fromEntries(entries.map((e) => [e.key, e.value]));
  }
}
