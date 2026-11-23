import { NonEmptyList, Phone, RequiredText } from '../../common/validation.js';

export class ReserveNumbersDto {
  @RequiredText('Nome', 80) name!: string;
  @Phone('WhatsApp') phone!: string;
  @NonEmptyList('Escolha pelo menos um número.') numbers!: unknown[];
}

export interface ReserveNumbersInput {
  slug: string;
  data: ReserveNumbersDto;
}

export interface GetPublicRaffleInput {
  slug: string;
  viewerId: number | null;
}

export interface PublicRaffleInfoDto {
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

export interface PublicRaffleDto {
  raffle: PublicRaffleInfoDto;
  photos: string[];
  taken: [number, 'p' | 'r', string][];
  winner: { number: number; name: string } | null;
}

export interface ReservationDto {
  token: string;
}

export interface BuyerOrderDto {
  token: string;
  status: string;
  buyer_name: string;
  numbers: number[];
  total_cents: number;
  expires_at: number;
}
