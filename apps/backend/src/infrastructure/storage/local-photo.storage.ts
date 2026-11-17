import fs from 'node:fs/promises';
import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { uploadDir } from '../../config/app.config.js';
import { randomHex } from '../../domain/rules/security.rules.js';
import { PhotoStorage } from '../../domain/repositories/photo-storage.js';

/** Fotos em disco, em DATA_DIR/uploads, servidas em /uploads/<arquivo>. */
@Injectable()
export class LocalPhotoStorage extends PhotoStorage {
  async save(bytes: Buffer, extension: string): Promise<string> {
    await fs.mkdir(uploadDir, { recursive: true });
    const filename = `${randomHex(12)}.${extension}`;
    await fs.writeFile(path.join(uploadDir, filename), bytes);
    return filename;
  }

  async remove(filename: string): Promise<void> {
    await fs.rm(path.join(uploadDir, path.basename(filename)), { force: true });
  }

  publicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
