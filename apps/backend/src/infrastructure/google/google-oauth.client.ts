import { Injectable } from '@nestjs/common';
import { appConfig, googleRedirectUri } from '../../config/app.config.js';
import { BusinessRuleError, UnauthenticatedError } from '../../domain/errors/domain.errors.js';
import type { GoogleAuthorizationRequest, GoogleProfile } from '../../domain/interfaces/google-identity.interface.js';
import { GoogleIdentityProvider } from '../../domain/repositories/google-identity.provider.js';
import type { GoogleIdTokenClaims, GoogleTokenResponse } from './interfaces/google-token.interface.js';

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const REJECTED = 'O Google não confirmou o login. Tente novamente.';

@Injectable()
export class GoogleOAuthClient extends GoogleIdentityProvider {
  authorizationUrl({ state, codeChallenge }: GoogleAuthorizationRequest): string {
    const params = new URLSearchParams({
      client_id: this.clientId(),
      redirect_uri: googleRedirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'select_account',
    });
    return `${AUTHORIZE_URL}?${params}`;
  }

  async exchangeCode(code: string, codeVerifier: string): Promise<GoogleProfile> {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        code_verifier: codeVerifier,
        client_id: this.clientId(),
        client_secret: appConfig.googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new UnauthenticatedError(REJECTED);

    const { id_token: idToken } = (await res.json()) as GoogleTokenResponse;
    const claims = this.decodeIdToken(idToken);
    const valid = claims.sub && claims.email
      && ISSUERS.includes(claims.iss ?? '')
      && claims.aud === this.clientId()
      && (claims.exp ?? 0) * 1000 > Date.now();
    if (!valid) throw new UnauthenticatedError(REJECTED);

    return {
      subject: claims.sub!,
      email: claims.email!,
      emailVerified: claims.email_verified === true || claims.email_verified === 'true',
      name: claims.name ?? '',
    };
  }

  // O id_token vem direto do Google (TLS, troca server-to-server com client_secret),
  // então basta conferir os claims — a assinatura não precisa ser revalidada (OIDC Core 3.1.3.7).
  private decodeIdToken(idToken: string | undefined): GoogleIdTokenClaims {
    const payload = idToken?.split('.')[1];
    if (!payload) throw new UnauthenticatedError(REJECTED);
    try {
      return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as GoogleIdTokenClaims;
    } catch {
      throw new UnauthenticatedError(REJECTED);
    }
  }

  private clientId(): string {
    if (!appConfig.googleClientId || !appConfig.googleClientSecret) {
      throw new BusinessRuleError('O login com Google ainda não foi configurado.');
    }
    return appConfig.googleClientId;
  }
}
