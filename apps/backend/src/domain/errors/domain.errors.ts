export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

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

export class NumbersUnavailableError extends DomainError {
  constructor(readonly numbers: number[]) {
    super(numbers.length === 1
      ? `O número ${numbers[0]} já foi reservado. Escolha outro.`
      : `Os números ${numbers.join(', ')} já foram reservados. Escolha outros.`);
  }
}
