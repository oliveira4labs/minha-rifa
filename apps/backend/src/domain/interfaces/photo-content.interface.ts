/** Foto já decodificada e validada, pronta para gravar. */
export interface PhotoContent {
  extension: 'jpg' | 'png' | 'webp';
  bytes: Buffer;
}
