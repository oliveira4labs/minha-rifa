// Senhas e identificadores aleatórios. Usa só node:crypto (sem estado, sem I/O).
import crypto from 'node:crypto';
import type { PasswordHash } from '../interfaces/password-hash.interface.js';

export const MIN_PASSWORD_LENGTH = 6;

export const randomHex = (bytes: number): string => crypto.randomBytes(bytes).toString('hex');

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function createPasswordHash(password: string): PasswordHash {
  const salt = randomHex(16);
  return { hash: hashPassword(password, salt), salt };
}

/** Comparação em tempo constante. */
export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(hashPassword(password, salt), 'hex'), Buffer.from(expectedHash, 'hex'));
}

/** Índice aleatório criptograficamente seguro (sorteio). */
export const secureRandomIndex = (length: number): number => crypto.randomInt(length);

export const newSessionToken = (): string => randomHex(32);
export const newOrderToken = (): string => randomHex(16);
export const newRaffleSlug = (): string => randomHex(5);
