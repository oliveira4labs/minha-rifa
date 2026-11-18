import {
  type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  BusinessRuleError, DomainError, NotFoundError, NumbersUnavailableError, UnauthenticatedError,
} from '../../../domain/errors/domain.errors.js';

function statusOf(err: DomainError): number {
  if (err instanceof NumbersUnavailableError) return HttpStatus.CONFLICT;
  if (err instanceof NotFoundError) return HttpStatus.NOT_FOUND;
  if (err instanceof UnauthenticatedError) return HttpStatus.UNAUTHORIZED;
  if (err instanceof BusinessRuleError) return HttpStatus.BAD_REQUEST;
  return HttpStatus.BAD_REQUEST;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('API');

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const send = (status: number, body: Record<string, unknown>) =>
      res.status(status).set('Cache-Control', 'no-store').json(body);

    if (exception instanceof DomainError) {
      const busy = exception instanceof NumbersUnavailableError ? exception.numbers : undefined;
      return void send(statusOf(exception), { error: exception.message, busy });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === HttpStatus.NOT_FOUND) return void send(status, { error: 'Rota não encontrada.' });
      return void send(status, { error: exception.message });
    }

    this.logger.error(exception);
    send(HttpStatus.INTERNAL_SERVER_ERROR, { error: 'Erro interno. Tente novamente.' });
  }
}
