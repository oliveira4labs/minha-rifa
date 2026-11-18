import type { Photo } from '../../interfaces/raffle.interface.js';

export interface IPhotoRepository {
  listByRaffle(raffleId: number): Promise<Photo[]>;
  replaceAll(raffleId: number, filenames: string[]): Promise<void>;
}
