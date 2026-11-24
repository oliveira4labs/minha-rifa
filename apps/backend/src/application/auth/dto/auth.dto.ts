export interface AuthUserDto {
  name: string;
  email: string;
}

export interface MeDto {
  user: AuthUserDto | null;
}

export interface SessionUserDto extends AuthUserDto {
  id: number;
}

export interface AuthSessionDto {
  user: AuthUserDto;
  sessionToken: string;
}

export interface GoogleLoginStartDto {
  authorizationUrl: string;
  state: string;
  codeVerifier: string;
}

export interface GoogleCallbackDto {
  code: string;
  state: string;
  expectedState: string;
  codeVerifier: string;
}
