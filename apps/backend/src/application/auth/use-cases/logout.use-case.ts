import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { OK, type OkDto } from '../../common/dto/ok.dto.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';

@Injectable()
export class LogoutUseCase implements UseCase<string | null, OkDto> {
  constructor(@Inject(SessionRepository) private readonly sessions: ISessionRepository) {}

  async execute(sessionToken: string | null): Promise<OkDto> {
    if (sessionToken) await this.sessions.delete(sessionToken);
    return OK;
  }
}
