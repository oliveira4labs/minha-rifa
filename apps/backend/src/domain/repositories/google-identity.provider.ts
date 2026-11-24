import type { GoogleAuthorizationRequest, GoogleProfile } from '../interfaces/google-identity.interface.js';
import type { IGoogleIdentityProvider } from './interfaces/google-identity.provider.interface.js';

export abstract class GoogleIdentityProvider implements IGoogleIdentityProvider {
  abstract authorizationUrl(request: GoogleAuthorizationRequest): string;
  abstract exchangeCode(code: string, codeVerifier: string): Promise<GoogleProfile>;
}
