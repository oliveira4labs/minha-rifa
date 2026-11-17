import type { Request } from 'express';
import type { SessionUserDto } from '../../../application/auth/dto/auth.dto.js';

/** Requisição depois do AuthGuard: carrega o usuário da sessão. */
export interface AuthenticatedRequest extends Request {
  user?: SessionUserDto;
}
