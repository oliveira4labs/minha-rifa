export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

export type NewUser = Omit<User, 'id'>;
