import { Inject, Injectable } from '@nestjs/common';
import { codeChallengeFor, newCodeVerifier, newOAuthState } from '../../../domain/rules/security.rules.js';
import type { UseCase } from '../../common/interfaces/use-case.interface.js';
import type { GoogleLoginStartDto } from '../dto/auth.dto.js';
import { GoogleIdentityProvider } from '../../../domain/repositories/google-identity.provider.js';
import type { IGoogleIdentityProvider } from '../../../domain/repositories/interfaces/google-identity.provider.interface.js';

@Injectable()
export class StartGoogleLoginUseCase implements UseCase<void, GoogleLoginStartDto> {
  constructor(@Inject(GoogleIdentityProvider) private readonly google: IGoogleIdentityProvider) {}

  async execute(): Promise<GoogleLoginStartDto> {
    const state = newOAuthState();
    const codeVerifier = newCodeVerifier();
    const authorizationUrl = this.google.authorizationUrl({ state, codeChallenge: codeChallengeFor(codeVerifier) });
    return { authorizationUrl, state, codeVerifier };
  }
}
