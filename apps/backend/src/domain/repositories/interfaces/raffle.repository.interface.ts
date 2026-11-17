import type { NewRaffle, Raffle, RaffleDetails } from '../../interfaces/raffle.interface.js';

/**
 * Rifas.
 */
export interface IRaffleRepository {
  findById(id: number): Promise<Raffle | null>;
  /** Só encontra se a rifa pertencer ao usuário. */
  findByIdAndOwner(id: number, userId: number): Promise<Raffle | null>;
  findBySlug(slug: string): Promise<Raffle | null>;
  /** Mais recentes primeiro. */
  listByOwner(userId: number): Promise<Raffle[]>;
  /** Devolve o id criado. */
  create(raffle: NewRaffle): Promise<number>;
  update(id: number, details: RaffleDetails): Promise<void>;
  /** Apaga a rifa e, em cascata, fotos (registros), pedidos e números. */
  delete(id: number): Promise<void>;
  markDrawn(id: number, winnerNumber: number, drawnAt: number): Promise<void>;
}
