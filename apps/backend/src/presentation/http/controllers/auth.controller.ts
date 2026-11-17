import {
  Body, Controller, Get, HttpCode, Post, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  type AuthUserDto, LoginDto, type MeDto, RegisterDto,
} from '../../../application/auth/dto/auth.dto.js';
import { GetSessionUserUseCase } from '../../../application/auth/use-cases/get-session-user.use-case.js';
import { LoginUseCase } from '../../../application/auth/use-cases/login.use-case.js';
import { LogoutUseCase } from '../../../application/auth/use-cases/logout.use-case.js';
import { RegisterUseCase } from '../../../application/auth/use-cases/register.use-case.js';
import type { OkDto } from '../../../application/common/dto/ok.dto.js';
import { SessionToken } from '../guards/auth.guard.js';
import { clearSessionCookie, setSessionCookie } from '../session-cookie.js';

@Controller()
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getSessionUser: GetSessionUserUseCase,
  ) {}

  @Post('register')
  @HttpCode(200)
  async registerAccount(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    const { user, sessionToken } = await this.register.execute(body);
    setSessionCookie(res, sessionToken);
    return user;
  }

  @Post('login')
  @HttpCode(200)
  async signIn(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthUserDto> {
    const { user, sessionToken } = await this.login.execute(body);
    setSessionCookie(res, sessionToken);
    return user;
  }

  @Post('logout')
  @HttpCode(200)
  async signOut(@SessionToken() token: string | null, @Res({ passthrough: true }) res: Response): Promise<OkDto> {
    const result = await this.logout.execute(token);
    clearSessionCookie(res);
    return result;
  }

  @Get('me')
  async me(@SessionToken() token: string | null): Promise<MeDto> {
    const user = await this.getSessionUser.execute(token);
    return { user: user ? { name: user.name, email: user.email } : null };
  }
}
