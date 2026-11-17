/** Linha da tabela `users` (snake_case, como no banco). */
export interface UserRow {
  id: number;
  name: string;
  email: string;
  pass_hash: string;
  salt: string;
  created_at: number;
}
