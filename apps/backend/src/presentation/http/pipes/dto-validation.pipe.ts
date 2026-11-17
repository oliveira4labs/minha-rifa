import { BadRequestException, ValidationPipe, type ValidationError } from '@nestjs/common';

function firstMessage(errors: ValidationError[]): string {
  for (const err of errors) {
    const msg = err.constraints && Object.values(err.constraints)[0];
    if (msg) return msg;
    if (err.children?.length) return firstMessage(err.children);
  }
  return 'Requisição inválida.';
}

/**
 * Converte o corpo JSON no DTO (aplicando trim, só dígitos, etc.) e valida.
 * Só os campos declarados no DTO passam; responde com a PRIMEIRA mensagem de erro.
 */
export const dtoValidationPipe = new ValidationPipe({
  transform: true,
  transformOptions: { excludeExtraneousValues: true },
  stopAtFirstError: true,
  exceptionFactory: (errors) => new BadRequestException(firstMessage(errors)),
});
