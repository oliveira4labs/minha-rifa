import type { NumberCounts, RaffleVisibility } from '../../../domain/interfaces/raffle.interface.js';
import { MAX_NUMBERS, RAFFLE_VISIBILITIES } from '../../../domain/rules/raffle.rules.js';
import {
  asArray, IntInRange, OneOf, OptionalIntInRange, OptionalText, Phone, Raw, RequiredText,
} from '../../common/validation.js';

export interface PhotoInputDto {
  id?: number | string | null;
  data?: string;
}

export class RaffleInputDto {
  @RequiredText('Título', 120) title!: string;
  @OptionalText('Descrição', 5000) description!: string;
  @RequiredText('Chave PIX', 200) pix_key!: string;
  @Phone('WhatsApp') whatsapp!: string;
  @IntInRange('Tempo de reserva (minutos)', 5, 60 * 24 * 30) reserve_minutes!: number;
  @OptionalIntInRange('Limite por comprador', 1, MAX_NUMBERS) max_per_buyer!: number | null;
  @OptionalIntInRange('Data do sorteio', 0, 4102444800000) draw_date!: number | null;
  @OneOf('Visibilidade', RAFFLE_VISIBILITIES, 'public') visibility!: RaffleVisibility;
  @Raw() total_numbers?: unknown;
  @Raw() price_cents?: unknown;
  @Raw(asArray) photos!: PhotoInputDto[];
}

export interface RaffleSummaryDto {
  id: number;
  slug: string;
  title: string;
  total_numbers: number;
  price_cents: number;
  status: string;
  visibility: string;
  draw_date: number | null;
  winner_number: number | null;
  paid: number;
  pending: number;
  awaiting: number;
  cover: string | null;
}

export interface CreatedRaffleDto {
  id: number;
  slug: string;
}

export interface AdminRaffleDto {
  id: number;
  slug: string;
  title: string;
  description: string;
  total_numbers: number;
  price_cents: number;
  pix_key: string;
  whatsapp: string;
  reserve_minutes: number;
  max_per_buyer: number | null;
  draw_date: number | null;
  status: string;
  visibility: string;
}

export interface AdminOrderDto {
  id: number;
  buyer_name: string | null;
  buyer_phone: string | null;
  numbers: number[];
  status: string;
  created_at: number;
  expires_at: number;
  proof_sent_at: number | null;
  paid_at: number | null;
}

export interface WinnerDto {
  number: number;
  name: string;
  phone: string;
  drawn_at: number | null;
}

export interface RaffleDetailsDto {
  raffle: AdminRaffleDto;
  photos: { id: number; url: string }[];
  orders: AdminOrderDto[];
  taken: [number, 'p' | 'r'][];
  counts: NumberCounts;
  can_draw: boolean;
  winner: WinnerDto | null;
}

export interface DrawResultDto {
  winner: WinnerDto | null;
}

export interface OwnedRaffleRefDto {
  userId: number;
  raffleId: number;
}

export interface CreateRaffleInputDto {
  userId: number;
  data: RaffleInputDto;
}

export interface UpdateRaffleInputDto extends OwnedRaffleRefDto {
  data: RaffleInputDto;
}
