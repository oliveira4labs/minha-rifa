/**
 * Contrato de todo caso de uso: uma única operação pública, `execute`.
 *
 * Regras (verificadas por `npm run lint:arch`):
 * - recebe e devolve DTOs;
 * - depende só do domínio (modelos, regras, erros) e das interfaces de repositório;
 * - NÃO chama outro caso de uso.
 */
export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
