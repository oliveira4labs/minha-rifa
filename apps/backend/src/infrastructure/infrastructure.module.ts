import { Global, Module } from '@nestjs/common';
import { OrderRepository } from '../domain/repositories/order.repository.js';
import { PhotoStorage } from '../domain/repositories/photo-storage.js';
import { PhotoRepository } from '../domain/repositories/photo.repository.js';
import { RaffleRepository } from '../domain/repositories/raffle.repository.js';
import { SessionRepository } from '../domain/repositories/session.repository.js';
import { UnitOfWork } from '../domain/repositories/unit-of-work.js';
import { UserRepository } from '../domain/repositories/user.repository.js';
import { PostgresUnitOfWork } from './database/postgres-unit-of-work.js';
import { PostgresDatabase } from './database/postgres.database.js';
import { PostgresOrderRepository } from './repositories/postgres-order.repository.js';
import { PostgresPhotoRepository } from './repositories/postgres-photo.repository.js';
import { PostgresRaffleRepository } from './repositories/postgres-raffle.repository.js';
import { PostgresSessionRepository } from './repositories/postgres-session.repository.js';
import { PostgresUserRepository } from './repositories/postgres-user.repository.js';
import { LocalPhotoStorage } from './storage/local-photo.storage.js';

const bindings = [
  { provide: UserRepository, useClass: PostgresUserRepository },
  { provide: SessionRepository, useClass: PostgresSessionRepository },
  { provide: RaffleRepository, useClass: PostgresRaffleRepository },
  { provide: PhotoRepository, useClass: PostgresPhotoRepository },
  { provide: OrderRepository, useClass: PostgresOrderRepository },
  { provide: PhotoStorage, useClass: LocalPhotoStorage },
  { provide: UnitOfWork, useClass: PostgresUnitOfWork },
];

@Global()
@Module({
  providers: [PostgresDatabase, ...bindings],
  exports: bindings.map((b) => b.provide),
})
export class InfrastructureModule {}
