import type { NewUser, User } from '../interfaces/user.interface.js';
import type { IUserRepository } from './interfaces/user.repository.interface.js';

export abstract class UserRepository implements IUserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByGoogleSub(googleSub: string): Promise<User | null>;
  abstract create(user: NewUser): Promise<User>;
  abstract linkGoogle(userId: number, googleSub: string): Promise<void>;
}
