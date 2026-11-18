import { Inject, Injectable } from '@nestjs/common';
import { UnauthenticatedError } from '../../../domain/errors/domain.errors.js';
import { newSessionToken, verifyPassword } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { AuthSessionDto, LoginDto } from '../dto/auth.dto.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { IUserRepository } from '../../../domain/repositories/interfaces/user.repository.interface.js';

@Injectable()
export class LoginUseCase implements UseCase<LoginDto, AuthSessionDto> {
  constructor(
    @Inject(UserRepository) private readonly users: IUserRepository,
    @Inject(SessionRepository) private readonly sessions: ISessionRepository,
  ) {}

  async execute({ email, password }: LoginDto): Promise<AuthSessionDto> {
    const user = await this.users.findByEmail(email);
    if (!user || !verifyPassword(password, user.salt, user.passwordHash)) {
      throw new UnauthenticatedError('E-mail ou senha incorretos.');
    }
    const sessionToken = newSessionToken();
    await this.sessions.create(sessionToken, user.id, Date.now());
    return { user: { name: user.name, email: user.email }, sessionToken };
  }
}
