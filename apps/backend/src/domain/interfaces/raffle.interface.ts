export type RaffleStatus = 'open' | 'drawn';

export type RaffleVisibility = 'public' | 'private';

export interface Raffle {
  id: number;
  slug: string;
  userId: number;
  title: string;
  description: string;
  totalNumbers: number;
  priceCents: number;
  pixKey: string;
  whatsapp: string;
  reserveMinutes: number;
  maxPerBuyer: number | null;
  drawDate: number | null;
  status: RaffleStatus;
  visibility: RaffleVisibility;
  winnerNumber: number | null;
  drawnAt: number | null;
  createdAt: number;
}

export interface RaffleDetails {
  title: string;
  description: string;
  totalNumbers: number;
  priceCents: number;
  pixKey: string;
  whatsapp: string;
  reserveMinutes: number;
  maxPerBuyer: number | null;
  drawDate: number | null;
  visibility: RaffleVisibility;
}

export type NewRaffle = RaffleDetails & { slug: string; userId: number; createdAt: number };

export interface Photo {
  id: number;
  raffleId: number;
  filename: string;
  position: number;
}

export interface NumberCounts {
  paid: number;
  pending: number;
}

export type RafflePricing = Pick<Raffle, 'totalNumbers' | 'priceCents'>;
