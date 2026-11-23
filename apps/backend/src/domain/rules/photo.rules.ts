import { BusinessRuleError } from '../errors/domain.errors.js';
import type { PhotoContent } from '../interfaces/photo-content.interface.js';

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const isPhotoFilename = (name: string): boolean => /^[a-f0-9]{8,64}\.(jpg|png|webp)$/.test(name);

export function decodePhotoDataUrl(dataUrl: unknown): PhotoContent {
  const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(typeof dataUrl === 'string' ? dataUrl : '');
  if (!match) throw new BusinessRuleError('Foto inválida. Use imagens JPG, PNG ou WebP.');
  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > MAX_PHOTO_BYTES) throw new BusinessRuleError('Cada foto pode ter no máximo 5 MB.');
  return { extension: match[1] === 'jpeg' ? 'jpg' : (match[1] as 'png' | 'webp'), bytes };
}
