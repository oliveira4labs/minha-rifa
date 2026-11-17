/**
 * Executa várias chamadas de repositório como uma única transação.
 * Dentro de `run`, use apenas repositórios (nada de I/O externo).
 */
export interface IUnitOfWork {
  run<T>(work: () => Promise<T>): Promise<T>;
}
