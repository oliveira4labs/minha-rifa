import type { IPhotoStorage } from './interfaces/photo-storage.interface.js';

export abstract class PhotoStorage implements IPhotoStorage {
  abstract save(bytes: Buffer, extension: string): Promise<string>;
  abstract remove(filename: string): Promise<void>;
  abstract publicUrl(filename: string): string;
}
