export interface GoogleProfile {
  subject: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

export interface GoogleAuthorizationRequest {
  state: string;
  codeChallenge: string;
}
