import { Inject, Injectable } from '@nestjs/common';
import { sessionCutoff } from '../../../domain/rules/session.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { SessionUserDto } from '../dto/auth.dto.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';

@Injectable()
export class GetSessionUserUseCase implements UseCase<string | null, SessionUserDto | null> {
  constructor(@Inject(SessionRepository) private readonly sessions: ISessionRepository) {}

  async execute(sessionToken: string | null): Promise<SessionUserDto | null> {
    if (!sessionToken) return null;
    const user = await this.sessions.findUserByToken(sessionToken, sessionCutoff(Date.now()));
    return user ? { id: user.id, name: user.name, email: user.email } : null;
  }
}
