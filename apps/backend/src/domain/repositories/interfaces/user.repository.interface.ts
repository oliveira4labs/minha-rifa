import type { NewUser, User } from '../../interfaces/user.interface.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
}
