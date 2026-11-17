import type { NewUser, User } from '../interfaces/user.interface.js';
import type { IUserRepository } from './interfaces/user.repository.interface.js';

/**
 * Token de injeção do Nest para `IUserRepository` (o contrato fica na interface).
 * Use case: `@Inject(UserRepository) private readonly x: IUserRepository`.
 * Implementação concreta: infrastructure/ (estende esta classe).
 */
export abstract class UserRepository implements IUserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: NewUser): Promise<User>;
}
