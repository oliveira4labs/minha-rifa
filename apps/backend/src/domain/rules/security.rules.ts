import crypto from 'node:crypto';

export const MAX_NAME_LENGTH = 80;

export const randomHex = (bytes: number): string => crypto.randomBytes(bytes).toString('hex');

export const secureRandomIndex = (length: number): number => crypto.randomInt(length);

export const newSessionToken = (): string => randomHex(32);
export const newOrderToken = (): string => randomHex(16);
export const newRaffleSlug = (): string => randomHex(5);

export const newOAuthState = (): string => randomHex(16);
export const newCodeVerifier = (): string => crypto.randomBytes(32).toString('base64url');
export const codeChallengeFor = (verifier: string): string =>
  crypto.createHash('sha256').update(verifier).digest('base64url');

export function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
