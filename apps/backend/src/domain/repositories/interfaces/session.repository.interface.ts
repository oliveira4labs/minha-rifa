import type { User } from '../../interfaces/user.interface.js';

export interface ISessionRepository {
  create(token: string, userId: number, createdAt: number): Promise<void>;
  /** Usuário da sessão, só se ela foi criada depois de `createdAfter`. */
  findUserByToken(token: string, createdAfter: number): Promise<User | null>;
  delete(token: string): Promise<void>;
  deleteCreatedUntil(cutoff: number): Promise<number>;
}
