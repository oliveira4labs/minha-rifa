// Erros de negócio. Não conhecem HTTP: a camada de apresentação traduz cada um para um status.

export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Dado de entrada inválido ou operação não permitida no estado atual. */
export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthenticatedError extends DomainError {
  constructor(message = 'Entre na sua conta para continuar.') {
    super(message);
  }
}

/** Um ou mais números já pertencem a outro pedido ativo. */
export class NumbersUnavailableError extends DomainError {
  constructor(readonly numbers: number[]) {
    super(`Os números ${numbers.join(', ')} acabaram de ser reservados por outra pessoa. Escolha outros.`);
  }
}
