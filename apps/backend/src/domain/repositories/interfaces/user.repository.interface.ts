import type { NewUser, User } from '../../interfaces/user.interface.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleSub(googleSub: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
  linkGoogle(userId: number, googleSub: string): Promise<void>;
}
