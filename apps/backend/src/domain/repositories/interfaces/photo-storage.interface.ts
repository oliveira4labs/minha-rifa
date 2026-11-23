import type { RaffleVisibility } from '../../interfaces/raffle.interface.js';

export interface IPhotoStorage {
  save(bytes: Buffer, extension: string, visibility: RaffleVisibility): Promise<string>;
  remove(filename: string): Promise<void>;
  setVisibility(filenames: string[], visibility: RaffleVisibility): Promise<void>;
  url(filename: string, visibility: RaffleVisibility): string;
}
