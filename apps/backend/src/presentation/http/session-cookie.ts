import type { Request, Response } from 'express';
import { appConfig, secureCookies } from '../../config/app.config.js';

const SESSION_COOKIE = 'sid';
const OAUTH_COOKIE = 'g_oauth';
const OAUTH_PATH = '/api/auth/google';

function cookie(name: string, value: string, maxAge: number, cookiePath = '/'): string {
  return `${name}=${value}; Path=${cookiePath}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureCookies ? '; Secure' : ''}`;
}

function readCookie(req: Request, name: string): string | null {
  const match = new RegExp(`(?:^|;\\s*)${name}=([^;]+)`).exec(req.headers.cookie || '');
  return match ? match[1] : null;
}

export const readSessionToken = (req: Request): string | null => readCookie(req, SESSION_COOKIE);

export function setSessionCookie(res: Response, token: string): void {
  res.append('Set-Cookie', cookie(SESSION_COOKIE, token, appConfig.sessionMaxAgeSeconds));
}

export function clearSessionCookie(res: Response): void {
  res.append('Set-Cookie', cookie(SESSION_COOKIE, '', 0));
}

export function setOAuthCookie(res: Response, state: string, codeVerifier: string): void {
  res.append('Set-Cookie', cookie(OAUTH_COOKIE, `${state}.${codeVerifier}`, appConfig.oauthStateMaxAgeSeconds, OAUTH_PATH));
}

export function takeOAuthCookie(req: Request, res: Response): [string, string] {
  res.append('Set-Cookie', cookie(OAUTH_COOKIE, '', 0, OAUTH_PATH));
  const [state = '', codeVerifier = ''] = (readCookie(req, OAUTH_COOKIE) ?? '').split('.');
  return [state, codeVerifier];
}
