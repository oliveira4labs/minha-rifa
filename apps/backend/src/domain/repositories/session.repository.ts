import type { User } from '../interfaces/user.interface.js';
import type { ISessionRepository } from './interfaces/session.repository.interface.js';

export abstract class SessionRepository implements ISessionRepository {
  abstract create(token: string, userId: number, createdAt: number): Promise<void>;
  abstract findUserByToken(token: string, activeSince: number): Promise<User | null>;
  abstract touch(token: string, now: number, staleBefore: number): Promise<void>;
  abstract delete(token: string): Promise<void>;
  abstract deleteIdleSince(cutoff: number): Promise<number>;
}
