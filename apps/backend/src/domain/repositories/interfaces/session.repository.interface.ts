import type { User } from '../../interfaces/user.interface.js';

/**
 * Sessões de login (token do cookie `sid`).
 */
export interface ISessionRepository {
  create(token: string, userId: number, createdAt: number): Promise<void>;
  findUserByToken(token: string): Promise<User | null>;
  delete(token: string): Promise<void>;
}
