import type { Request, Response } from 'express';
import { appConfig } from '../../config/app.config.js';

const COOKIE = 'sid';

export function readSessionToken(req: Request): string | null {
  const match = new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`).exec(req.headers.cookie || '');
  return match ? match[1] : null;
}

export function setSessionCookie(res: Response, token: string): void {
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${appConfig.sessionMaxAgeSeconds}`);
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}
