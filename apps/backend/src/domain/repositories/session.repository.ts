import type { User } from '../interfaces/user.interface.js';
import type { ISessionRepository } from './interfaces/session.repository.interface.js';

/**
 * Token de injeção do Nest para `ISessionRepository` (o contrato fica na interface).
 * Use case: `@Inject(SessionRepository) private readonly x: ISessionRepository`.
 * Implementação concreta: infrastructure/ (estende esta classe).
 */
export abstract class SessionRepository implements ISessionRepository {
  abstract create(token: string, userId: number, createdAt: number): Promise<void>;
  abstract findUserByToken(token: string): Promise<User | null>;
  abstract delete(token: string): Promise<void>;
}
