import type { Photo } from '../../interfaces/raffle.interface.js';

export interface IPhotoRepository {
  listByRaffle(raffleId: number): Promise<Photo[]>;
  findByFilename(filename: string): Promise<Photo | null>;
  replaceAll(raffleId: number, filenames: string[]): Promise<void>;
}
