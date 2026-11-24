import { Inject, Injectable } from '@nestjs/common';
import { sessionIdleCutoff, sessionTouchCutoff } from '../../../domain/rules/session.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { SessionUserDto } from '../dto/auth.dto.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';

/** Valida a sessão (expira após 1 dia sem uso) e renova a validade a cada uso. */
@Injectable()
export class GetSessionUserUseCase implements UseCase<string | null, SessionUserDto | null> {
  constructor(@Inject(SessionRepository) private readonly sessions: ISessionRepository) {}

  async execute(sessionToken: string | null): Promise<SessionUserDto | null> {
    if (!sessionToken) return null;
    const now = Date.now();
    const user = await this.sessions.findUserByToken(sessionToken, sessionIdleCutoff(now));
    if (!user) return null;
    await this.sessions.touch(sessionToken, now, sessionTouchCutoff(now));
    return { id: user.id, name: user.name, email: user.email };
  }
}
