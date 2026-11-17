import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../domain/repositories/unit-of-work.js';
import { PostgresDatabase } from './postgres.database.js';

/** Transação Postgres (SERIALIZABLE, com nova tentativa em conflito; reentrante). */
@Injectable()
export class PostgresUnitOfWork extends UnitOfWork {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.db.transaction(work);
  }
}
