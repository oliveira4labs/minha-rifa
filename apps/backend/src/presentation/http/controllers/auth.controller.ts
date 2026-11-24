import {
  Controller, Get, HttpCode, Post, Query, Req, Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { MeDto } from '../../../application/auth/dto/auth.dto.js';
import { GetSessionUserUseCase } from '../../../application/auth/use-cases/get-session-user.use-case.js';
import { GoogleLoginUseCase } from '../../../application/auth/use-cases/google-login.use-case.js';
import { LogoutUseCase } from '../../../application/auth/use-cases/logout.use-case.js';
import { StartGoogleLoginUseCase } from '../../../application/auth/use-cases/start-google-login.use-case.js';
import type { OkDto } from '../../../application/common/dto/ok.dto.js';
import { DomainError } from '../../../domain/errors/domain.errors.js';
import { SessionToken } from '../guards/auth.guard.js';
import {
  clearSessionCookie, setOAuthCookie, setSessionCookie, takeOAuthCookie,
} from '../session-cookie.js';

const AFTER_LOGIN = '/painel';
const LOGIN_PAGE = '/';
const GENERIC_ERROR = 'Não foi possível entrar com o Google. Tente novamente.';

@Controller()
export class AuthController {
  constructor(
    private readonly startGoogleLogin: StartGoogleLoginUseCase,
    private readonly googleLogin: GoogleLoginUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getSessionUser: GetSessionUserUseCase,
  ) {}

  @Get('auth/google')
  async google(@Res() res: Response): Promise<void> {
    try {
      const { authorizationUrl, state, codeVerifier } = await this.startGoogleLogin.execute();
      setOAuthCookie(res, state, codeVerifier);
      res.redirect(302, authorizationUrl);
    } catch (err) {
      this.backToLogin(res, err);
    }
  }

  @Get('auth/google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const [expectedState, codeVerifier] = takeOAuthCookie(req, res);
    try {
      const { sessionToken } = await this.googleLogin.execute({
        code: String(code ?? ''), state: String(state ?? ''), expectedState, codeVerifier,
      });
      setSessionCookie(res, sessionToken);
      res.redirect(302, AFTER_LOGIN);
    } catch (err) {
      this.backToLogin(res, err);
    }
  }

  @Post('logout')
  @HttpCode(200)
  async signOut(@SessionToken() token: string | null, @Res({ passthrough: true }) res: Response): Promise<OkDto> {
    const result = await this.logout.execute(token);
    clearSessionCookie(res);
    return result;
  }

  @Get('me')
  async me(@SessionToken() token: string | null, @Res({ passthrough: true }) res: Response): Promise<MeDto> {
    const user = await this.getSessionUser.execute(token);
    if (user && token) setSessionCookie(res, token);
    else if (token) clearSessionCookie(res);
    return { user: user ? { name: user.name, email: user.email } : null };
  }

  private backToLogin(res: Response, err: unknown): void {
    if (!(err instanceof DomainError)) console.error('Login com Google falhou:', err);
    const message = err instanceof DomainError ? err.message : GENERIC_ERROR;
    res.redirect(302, `${LOGIN_PAGE}?erro=${encodeURIComponent(message)}`);
  }
}
