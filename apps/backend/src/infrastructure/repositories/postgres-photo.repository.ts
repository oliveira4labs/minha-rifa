import { Injectable } from '@nestjs/common';
import type { Photo } from '../../domain/interfaces/raffle.interface.js';
import { PhotoRepository } from '../../domain/repositories/photo.repository.js';
import type { PhotoRow } from '../database/interfaces/raffle-row.interface.js';
import { PostgresDatabase } from '../database/postgres.database.js';

const toPhoto = (p: PhotoRow): Photo => ({
  id: p.id, raffleId: p.raffle_id, filename: p.filename, position: p.position,
});

@Injectable()
export class PostgresPhotoRepository extends PhotoRepository {
  constructor(private readonly db: PostgresDatabase) {
    super();
  }

  async listByRaffle(raffleId: number): Promise<Photo[]> {
    const rows = await this.db.query<PhotoRow>('SELECT * FROM photos WHERE raffle_id = $1 ORDER BY position', [raffleId]);
    return rows.map(toPhoto);
  }

  async findByFilename(filename: string): Promise<Photo | null> {
    const row = await this.db.one<PhotoRow>('SELECT * FROM photos WHERE filename = $1 LIMIT 1', [filename]);
    return row ? toPhoto(row) : null;
  }

  async replaceAll(raffleId: number, filenames: string[]): Promise<void> {
    await this.db.transaction(async () => {
      await this.db.query('DELETE FROM photos WHERE raffle_id = $1 AND NOT (filename = ANY($2::text[]))', [raffleId, filenames]);
      const kept = new Set((await this.listByRaffle(raffleId)).map((p) => p.filename));
      for (const [position, filename] of filenames.entries()) {
        if (kept.has(filename)) {
          await this.db.query('UPDATE photos SET position = $1 WHERE raffle_id = $2 AND filename = $3', [position, raffleId, filename]);
        } else {
          await this.db.query('INSERT INTO photos (raffle_id, filename, position) VALUES ($1, $2, $3)', [raffleId, filename, position]);
        }
      }
    });
  }
}
