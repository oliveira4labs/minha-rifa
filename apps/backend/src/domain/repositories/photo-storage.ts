import type { IPhotoStorage } from './interfaces/photo-storage.interface.js';

/**
 * Token de injeção do Nest para `IPhotoStorage` (o contrato fica na interface).
 * Use case: `@Inject(PhotoStorage) private readonly x: IPhotoStorage`.
 * Implementação concreta: infrastructure/ (estende esta classe).
 */
export abstract class PhotoStorage implements IPhotoStorage {
  abstract save(bytes: Buffer, extension: string): Promise<string>;
  abstract remove(filename: string): Promise<void>;
  abstract publicUrl(filename: string): string;
}
