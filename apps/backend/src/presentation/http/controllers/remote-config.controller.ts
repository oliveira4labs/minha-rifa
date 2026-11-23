import { Controller, Get } from '@nestjs/common';
import type { PublicConfigDto } from '../../../application/remote-config/dto/remote-config.dto.js';
import { GetPublicConfigUseCase } from '../../../application/remote-config/use-cases/get-public-config.use-case.js';

@Controller('config')
export class RemoteConfigController {
  constructor(private readonly getPublicConfig: GetPublicConfigUseCase) {}

  @Get()
  config(): Promise<PublicConfigDto> {
    return this.getPublicConfig.execute();
  }
}
