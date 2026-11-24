import type { User } from '../../domain/interfaces/user.interface.js';
import type { UserRow } from '../database/interfaces/user-row.interface.js';

export const toUser = (r: UserRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  googleSub: r.google_sub,
  createdAt: r.created_at,
});
