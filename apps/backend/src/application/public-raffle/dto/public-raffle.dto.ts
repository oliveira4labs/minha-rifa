import { NonEmptyList, Phone, RequiredText } from '../../common/validation.js';

// ---- entrada

export class ReserveNumbersDto {
  @RequiredText('Nome', 80) name!: string;
  @Phone('WhatsApp') phone!: string;
  /** Cada número é validado no caso de uso (depende do total da rifa). */
  @NonEmptyList('Escolha pelo menos um número.') numbers!: unknown[];
}

export interface ReserveNumbersInput {
  slug: string;
  data: ReserveNumbersDto;
}

// ---- saída

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
}

/**
 * Página pública. `taken` = [número, 'p' | 'r', nome abreviado].
 * Nunca inclui telefones de compradores.
 */
export interface PublicRaffleDto {
  raffle: PublicRaffleInfoDto;
  photos: string[];
  taken: [number, 'p' | 'r', string][];
  winner: { number: number; name: string } | null;
}

export interface ReservationDto {
  /** Credencial do comprador para consultar o pedido depois. */
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
