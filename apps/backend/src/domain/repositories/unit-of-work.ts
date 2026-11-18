import type { IUnitOfWork } from './interfaces/unit-of-work.interface.js';

export abstract class UnitOfWork implements IUnitOfWork {
  abstract run<T>(work: () => Promise<T>): Promise<T>;
}
