import type { NewRaffle, Raffle, RaffleDetails } from '../../interfaces/raffle.interface.js';

export interface IRaffleRepository {
  findById(id: number): Promise<Raffle | null>;
  findByIdAndOwner(id: number, userId: number): Promise<Raffle | null>;
  findBySlug(slug: string): Promise<Raffle | null>;
  listByOwner(userId: number): Promise<Raffle[]>;
  create(raffle: NewRaffle): Promise<number>;
  update(id: number, details: RaffleDetails): Promise<void>;
  delete(id: number): Promise<void>;
  markDrawn(id: number, winnerNumber: number, drawnAt: number): Promise<void>;
}
