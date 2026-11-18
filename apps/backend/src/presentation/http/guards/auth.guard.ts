import {
  type CanActivate, createParamDecorator, type ExecutionContext, Injectable, UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { SessionUserDto } from '../../../application/auth/dto/auth.dto.js';
import { GetSessionUserUseCase } from '../../../application/auth/use-cases/get-session-user.use-case.js';
import { readSessionToken } from '../session-cookie.js';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly getSessionUser: GetSessionUserUseCase) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.getSessionUser.execute(readSessionToken(req));
    if (!user) throw new UnauthorizedException('Entre na sua conta para continuar.');
    req.user = user;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SessionUserDto => ctx.switchToHttp().getRequest<AuthenticatedRequest>().user!,
);

export const SessionToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | null => readSessionToken(ctx.switchToHttp().getRequest<Request>()),
);
