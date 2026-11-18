import type { User } from '../interfaces/user.interface.js';
import type { ISessionRepository } from './interfaces/session.repository.interface.js';

export abstract class SessionRepository implements ISessionRepository {
  abstract create(token: string, userId: number, createdAt: number): Promise<void>;
  abstract findUserByToken(token: string): Promise<User | null>;
  abstract delete(token: string): Promise<void>;
}
