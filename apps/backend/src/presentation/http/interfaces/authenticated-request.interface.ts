import type { Request } from 'express';
import type { SessionUserDto } from '../../../application/auth/dto/auth.dto.js';

export interface AuthenticatedRequest extends Request {
  user?: SessionUserDto;
}
