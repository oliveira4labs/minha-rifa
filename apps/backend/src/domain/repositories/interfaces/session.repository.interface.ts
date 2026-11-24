import type { User } from '../../interfaces/user.interface.js';

export interface ISessionRepository {
  create(token: string, userId: number, createdAt: number): Promise<void>;
  /** Usuário da sessão, só se ela foi usada depois de `activeSince`. */
  findUserByToken(token: string, activeSince: number): Promise<User | null>;
  /** Marca a sessão como usada em `now`, se o último uso foi antes de `staleBefore`. */
  touch(token: string, now: number, staleBefore: number): Promise<void>;
  delete(token: string): Promise<void>;
  deleteIdleSince(cutoff: number): Promise<number>;
}
