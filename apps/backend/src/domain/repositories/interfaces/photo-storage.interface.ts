/**
 * Arquivos de imagem. Tratado como repositório: é só persistência.
 */
export interface IPhotoStorage {
  /** Grava e devolve o nome do arquivo gerado. */
  save(bytes: Buffer, extension: string): Promise<string>;
  remove(filename: string): Promise<void>;
  /** Caminho público da foto (ex.: /uploads/abc.jpg). */
  publicUrl(filename: string): string;
}
