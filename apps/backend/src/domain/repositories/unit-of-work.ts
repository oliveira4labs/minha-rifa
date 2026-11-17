import type { IUnitOfWork } from './interfaces/unit-of-work.interface.js';

/**
 * Token de injeção do Nest para `IUnitOfWork` (o contrato fica na interface).
 * Use case: `@Inject(UnitOfWork) private readonly x: IUnitOfWork`.
 * Implementação concreta: infrastructure/ (estende esta classe).
 */
export abstract class UnitOfWork implements IUnitOfWork {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}
