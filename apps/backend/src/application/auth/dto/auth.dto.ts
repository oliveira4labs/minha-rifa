import { MIN_PASSWORD_LENGTH } from '../../../domain/rules/security.rules.js';
import { Email, Password, RequiredText } from '../../common/validation.js';

export class RegisterDto {
  @RequiredText('Nome', 80) name!: string;
  @Email({ checkFormat: true }) email!: string;
  @Password(MIN_PASSWORD_LENGTH) password!: string;
}

export class LoginDto {
  @Email({ checkFormat: false }) email!: string;
  @Password(0) password!: string;
}

export interface AuthUserDto {
  name: string;
  email: string;
}

export interface MeDto {
  user: AuthUserDto | null;
}

export interface SessionUserDto extends AuthUserDto {
  id: number;
}

export interface AuthSessionDto {
  user: AuthUserDto;
  sessionToken: string;
}
