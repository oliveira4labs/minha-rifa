export interface IPhotoStorage {
  save(bytes: Buffer, extension: string): Promise<string>;
  remove(filename: string): Promise<void>;
  publicUrl(filename: string): string;
}
