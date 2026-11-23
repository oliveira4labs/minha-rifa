import type { NewRaffle, Raffle, RaffleDetails } from '../interfaces/raffle.interface.js';
import type { IRaffleRepository } from './interfaces/raffle.repository.interface.js';

export abstract class RaffleRepository implements IRaffleRepository {
  abstract findById(id: number): Promise<Raffle | null>;
  abstract findByIdAndOwner(id: number, userId: number): Promise<Raffle | null>;
  abstract findBySlug(slug: string): Promise<Raffle | null>;
  abstract listByOwner(userId: number): Promise<Raffle[]>;
  abstract create(raffle: NewRaffle): Promise<number>;
  abstract update(id: number, details: RaffleDetails): Promise<void>;
  abstract delete(id: number): Promise<void>;
  abstract markDrawn(id: number, winnerNumber: number, drawnAt: number): Promise<void>;
}
