import type { RaffleVisibility } from '../interfaces/raffle.interface.js';
import type { IPhotoStorage } from './interfaces/photo-storage.interface.js';

export abstract class PhotoStorage implements IPhotoStorage {
  abstract save(bytes: Buffer, extension: string, visibility: RaffleVisibility): Promise<string>;
  abstract remove(filename: string): Promise<void>;
  abstract setVisibility(filenames: string[], visibility: RaffleVisibility): Promise<void>;
  abstract url(filename: string, visibility: RaffleVisibility): string;
}
