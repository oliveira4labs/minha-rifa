import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError } from '../../../domain/errors/domain.errors.js';
import { CONFIG_KEYS, isDisabled } from '../../../domain/rules/remote-config.rules.js';
import { createPasswordHash, newSessionToken } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { AuthSessionDto, RegisterDto } from '../dto/auth.dto.js';
import { RemoteConfigRepository } from '../../../domain/repositories/remote-config.repository.js';
import type { IRemoteConfigRepository } from '../../../domain/repositories/interfaces/remote-config.repository.interface.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { IUserRepository } from '../../../domain/repositories/interfaces/user.repository.interface.js';

@Injectable()
export class RegisterUseCase implements UseCase<RegisterDto, AuthSessionDto> {
  constructor(
    @Inject(UserRepository) private readonly users: IUserRepository,
    @Inject(SessionRepository) private readonly sessions: ISessionRepository,
    @Inject(RemoteConfigRepository) private readonly config: IRemoteConfigRepository,
  ) {}

  async execute({ name, email, password }: RegisterDto): Promise<AuthSessionDto> {
    if (isDisabled(await this.config.get(CONFIG_KEYS.createUser))) {
      throw new BusinessRuleError('O cadastro de novas contas está desativado no momento.');
    }
    if (await this.users.findByEmail(email)) throw new BusinessRuleError('Já existe uma conta com este e-mail.');

    const { hash, salt } = createPasswordHash(password);
    const now = Date.now();
    const user = await this.users.create({ name, email, passwordHash: hash, salt, createdAt: now });

    const sessionToken = newSessionToken();
    await this.sessions.create(sessionToken, user.id, now);
    return { user: { name: user.name, email: user.email }, sessionToken };
  }
}
