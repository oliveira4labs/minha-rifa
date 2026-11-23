import fs from 'node:fs/promises';
import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { privateUploadDir, publicUploadDir } from '../../config/app.config.js';
import type { RaffleVisibility } from '../../domain/interfaces/raffle.interface.js';
import { randomHex } from '../../domain/rules/security.rules.js';
import { PhotoStorage } from '../../domain/repositories/photo-storage.js';

const dirOf = (visibility: RaffleVisibility): string => (visibility === 'private' ? privateUploadDir : publicUploadDir);

@Injectable()
export class LocalPhotoStorage extends PhotoStorage {
  async save(bytes: Buffer, extension: string, visibility: RaffleVisibility): Promise<string> {
    const dir = dirOf(visibility);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${randomHex(12)}.${extension}`;
    await fs.writeFile(path.join(dir, filename), bytes);
    return filename;
  }

  async remove(filename: string): Promise<void> {
    const name = path.basename(filename);
    await Promise.all([publicUploadDir, privateUploadDir].map((dir) => fs.rm(path.join(dir, name), { force: true })));
  }

  async setVisibility(filenames: string[], visibility: RaffleVisibility): Promise<void> {
    const target = dirOf(visibility);
    const source = dirOf(visibility === 'private' ? 'public' : 'private');
    await fs.mkdir(target, { recursive: true });
    for (const filename of filenames) {
      const name = path.basename(filename);
      try {
        await fs.rename(path.join(source, name), path.join(target, name));
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
      }
    }
  }

  url(filename: string, visibility: RaffleVisibility): string {
    return `/uploads/${visibility}/${filename}`;
  }
}
