import type { GoogleAuthorizationRequest, GoogleProfile } from '../../interfaces/google-identity.interface.js';

export interface IGoogleIdentityProvider {
  authorizationUrl(request: GoogleAuthorizationRequest): string;
  exchangeCode(code: string, codeVerifier: string): Promise<GoogleProfile>;
}
