import { MAX_NUMBERS } from '../../../domain/rules/raffle.rules.js';
import {
  IntInRange, OptionalText, Phone, RequiredText,
} from '../../common/validation.js';

export class HoldNumberDto {
  @OptionalText('Carrinho', 64) token!: string;
  @IntInRange('Número', 1, MAX_NUMBERS) number!: number;
}

export class ReleaseNumberDto {
  @RequiredText('Carrinho', 64) token!: string;
  @IntInRange('Número', 1, MAX_NUMBERS) number!: number;
}

export class ReserveNumbersDto {
  @RequiredText('Carrinho', 64) token!: string;
  @RequiredText('Nome', 80) name!: string;
  @Phone('WhatsApp') phone!: string;
}

export interface HoldNumberInput {
  slug: string;
  data: HoldNumberDto;
}

export interface ReleaseNumberInput {
  slug: string;
  data: ReleaseNumberDto;
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

export interface CartDto {
  token: string | null;
  numbers: number[];
  expires_at: number | null;
}

export interface ReservationDto {
  token: string;
}

export interface BuyerOrderDto {
  token: string;
  status: string;
  buyer_name: string | null;
  numbers: number[];
  total_cents: number;
  expires_at: number;
  proof_sent_at: number | null;
}
