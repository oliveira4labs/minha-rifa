import type { Photo } from '../../interfaces/raffle.interface.js';

/**
 * Registros das fotos de uma rifa (o arquivo em si fica no PhotoStorage).
 */
export interface IPhotoRepository {
  /** Na ordem de exibição (a primeira é a capa). */
  listByRaffle(raffleId: number): Promise<Photo[]>;
  /** Substitui todas as fotos da rifa pelos arquivos informados, nesta ordem. */
  replaceAll(raffleId: number, filenames: string[]): Promise<void>;
}
