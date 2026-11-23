import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { SessionUserDto } from '../dto/auth.dto.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';

@Injectable()
export class GetSessionUserUseCase implements UseCase<string | null, SessionUserDto | null> {
  constructor(@Inject(SessionRepository) private readonly sessions: ISessionRepository) {}

  async execute(sessionToken: string | null): Promise<SessionUserDto | null> {
    if (!sessionToken) return null;
    const user = await this.sessions.findUserByToken(sessionToken);
    return user ? { id: user.id, name: user.name, email: user.email } : null;
  }
}
