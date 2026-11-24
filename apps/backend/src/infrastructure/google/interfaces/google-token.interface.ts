export interface GoogleTokenResponse {
  id_token?: string;
}

export interface GoogleIdTokenClaims {
  iss?: string;
  aud?: string;
  exp?: number;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
}
