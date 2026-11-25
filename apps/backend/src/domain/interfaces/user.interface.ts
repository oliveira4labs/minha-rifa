export interface User {
  id: number;
  name: string;
  email: string;
  googleSub: string | null;
  createdAt: number;
}

export type NewUser = Omit<User, 'id'>;
