import type { Photo } from '../interfaces/raffle.interface.js';
import type { IPhotoRepository } from './interfaces/photo.repository.interface.js';

/**
 * Token de injeção do Nest para `IPhotoRepository` (o contrato fica na interface).
 * Use case: `@Inject(PhotoRepository) private readonly x: IPhotoRepository`.
 * Implementação concreta: infrastructure/ (estende esta classe).
 */
export abstract class PhotoRepository implements IPhotoRepository {
  abstract listByRaffle(raffleId: number): Promise<Photo[]>;
  abstract replaceAll(raffleId: number, filenames: string[]): Promise<void>;
}
