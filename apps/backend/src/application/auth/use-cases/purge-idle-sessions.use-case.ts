import { Inject, Injectable } from '@nestjs/common';
import { sessionIdleCutoff } from '../../../domain/rules/session.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';

@Injectable()
export class PurgeIdleSessionsUseCase implements UseCase<number, number> {
  constructor(@Inject(SessionRepository) private readonly sessions: ISessionRepository) {}

  execute(now: number = Date.now()): Promise<number> {
    return this.sessions.deleteIdleSince(sessionIdleCutoff(now));
  }
}
