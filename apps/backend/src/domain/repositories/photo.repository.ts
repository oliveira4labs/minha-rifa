import type { Photo } from '../interfaces/raffle.interface.js';
import type { IPhotoRepository } from './interfaces/photo.repository.interface.js';

export abstract class PhotoRepository implements IPhotoRepository {
  abstract listByRaffle(raffleId: number): Promise<Photo[]>;
  abstract findByFilename(filename: string): Promise<Photo | null>;
  abstract replaceAll(raffleId: number, filenames: string[]): Promise<void>;
}
