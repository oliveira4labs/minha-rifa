import type { RaffleStatus, RaffleVisibility } from '../../../domain/interfaces/raffle.interface.js';

export interface RaffleRow {
  id: number;
  slug: string;
  user_id: number;
  title: string;
  description: string;
  total_numbers: number;
  price_cents: number;
  pix_key: string;
  whatsapp: string;
  reserve_minutes: number;
  max_per_buyer: number | null;
  draw_date: number | null;
  status: RaffleStatus;
  visibility: RaffleVisibility;
  winner_number: number | null;
  drawn_at: number | null;
  created_at: number;
}

export interface PhotoRow {
  id: number;
  raffle_id: number;
  filename: string;
  position: number;
}
