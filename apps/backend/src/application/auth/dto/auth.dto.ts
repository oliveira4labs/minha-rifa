import { MIN_PASSWORD_LENGTH } from '../../../domain/rules/security.rules.js';
import { Email, Password, RequiredText } from '../../common/validation.js';

// ---- entrada

export class RegisterDto {
  @RequiredText('Nome', 80) name!: string;
  @Email({ checkFormat: true }) email!: string;
  @Password(MIN_PASSWORD_LENGTH) password!: string;
}

export class LoginDto {
  @Email({ checkFormat: false }) email!: string;
  @Password(0) password!: string;
}

// ---- saída

/** O que o front sabe sobre o usuário logado. */
export interface AuthUserDto {
  name: string;
  email: string;
}

/** Resposta de GET /api/me. */
export interface MeDto {
  user: AuthUserDto | null;
}

/** Usuário identificado pela sessão (uso interno da API: guard, controllers). */
export interface SessionUserDto extends AuthUserDto {
  id: number;
}

/** Resultado de login/cadastro: o controller transforma o token em cookie. */
export interface AuthSessionDto {
  user: AuthUserDto;
  sessionToken: string;
}
