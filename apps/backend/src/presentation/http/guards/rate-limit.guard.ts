import {
  applyDecorators, type CanActivate, type ExecutionContext, HttpException, HttpStatus, Injectable, SetMetadata, UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { RateLimitRule, RateLimitWindow } from '../interfaces/rate-limit.interface.js';

const RATE_LIMIT_KEY = 'rateLimit';
const SWEEP_EVERY_MS = 60_000;

const windows = new Map<string, RateLimitWindow>();
let nextSweepAt = 0;

function sweep(now: number): void {
  if (now < nextSweepAt) return;
  nextSweepAt = now + SWEEP_EVERY_MS;
  for (const [key, window] of windows) if (window.resetAt <= now) windows.delete(key);
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rule = this.reflector.get<RateLimitRule | undefined>(RATE_LIMIT_KEY, context.getHandler());
    if (!rule) return true;

    const now = Date.now();
    sweep(now);
    const ip = context.switchToHttp().getRequest<Request>().ip ?? 'desconhecido';
    const key = `${rule.bucket}:${ip}`;
    let window = windows.get(key);
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + rule.windowMs };
      windows.set(key, window);
    }
    window.count += 1;
    if (window.count > rule.limit) {
      throw new HttpException('Muitas tentativas em pouco tempo. Espere um minuto e tente de novo.', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}

export const RateLimit = (rule: RateLimitRule) => applyDecorators(SetMetadata(RATE_LIMIT_KEY, rule), UseGuards(RateLimitGuard));
