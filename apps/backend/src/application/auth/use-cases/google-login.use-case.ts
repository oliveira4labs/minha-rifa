import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleError, UnauthenticatedError } from '../../../domain/errors/domain.errors.js';
import type { GoogleProfile } from '../../../domain/interfaces/google-identity.interface.js';
import type { User } from '../../../domain/interfaces/user.interface.js';
import { CONFIG_KEYS, isDisabled } from '../../../domain/rules/remote-config.rules.js';
import { MAX_NAME_LENGTH, newSessionToken, sameToken } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { AuthSessionDto, GoogleCallbackDto } from '../dto/auth.dto.js';
import { GoogleIdentityProvider } from '../../../domain/repositories/google-identity.provider.js';
import type { IGoogleIdentityProvider } from '../../../domain/repositories/interfaces/google-identity.provider.interface.js';
import { RemoteConfigRepository } from '../../../domain/repositories/remote-config.repository.js';
import type { IRemoteConfigRepository } from '../../../domain/repositories/interfaces/remote-config.repository.interface.js';
import { SessionRepository } from '../../../domain/repositories/session.repository.js';
import type { ISessionRepository } from '../../../domain/repositories/interfaces/session.repository.interface.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { IUserRepository } from '../../../domain/repositories/interfaces/user.repository.interface.js';

@Injectable()
export class GoogleLoginUseCase implements UseCase<GoogleCallbackDto, AuthSessionDto> {
  constructor(
    @Inject(GoogleIdentityProvider) private readonly google: IGoogleIdentityProvider,
    @Inject(UserRepository) private readonly users: IUserRepository,
    @Inject(SessionRepository) private readonly sessions: ISessionRepository,
    @Inject(RemoteConfigRepository) private readonly config: IRemoteConfigRepository,
  ) {}

  async execute({
    code, state, expectedState, codeVerifier,
  }: GoogleCallbackDto): Promise<AuthSessionDto> {
    if (!code || !state || !expectedState || !codeVerifier || !sameToken(state, expectedState)) {
      throw new UnauthenticatedError('Não foi possível entrar com o Google. Tente novamente.');
    }

    const profile = await this.google.exchangeCode(code, codeVerifier);
    if (!profile.emailVerified) throw new UnauthenticatedError('Seu e-mail do Google ainda não foi verificado.');

    const user = await this.findOrCreateUser(profile);
    const sessionToken = newSessionToken();
    await this.sessions.create(sessionToken, user.id, Date.now());
    return { user: { name: user.name, email: user.email }, sessionToken };
  }

  private async findOrCreateUser(profile: GoogleProfile): Promise<User> {
    const linked = await this.users.findByGoogleSub(profile.subject);
    if (linked) return linked;

    const email = profile.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) {
      if (existing.googleSub) throw new UnauthenticatedError('Este e-mail já está ligado a outra conta Google.');
      await this.users.linkGoogle(existing.id, profile.subject);
      return { ...existing, googleSub: profile.subject };
    }

    if (isDisabled(await this.config.get(CONFIG_KEYS.createUser))) {
      throw new BusinessRuleError('O cadastro de novas contas está desativado no momento.');
    }

    const name = (profile.name.trim() || email).slice(0, MAX_NAME_LENGTH);
    return this.users.create({ name, email, googleSub: profile.subject, createdAt: Date.now() });
  }
}
