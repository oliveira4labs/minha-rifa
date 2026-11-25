import type { OrderStatus } from '../../../domain/interfaces/order.interface.js';

export interface OrderRow {
  id: number;
  raffle_id: number;
  token: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  numbers: number[];
  status: OrderStatus;
  created_at: number;
  expires_at: number;
  proof_sent_at: number | null;
  paid_at: number | null;
}

export interface TakenNumberRow {
  number: number;
  status: OrderStatus;
  buyer_name: string | null;
  buyer_phone: string | null;
}

export interface NumberCountsRow {
  paid: number;
  pending: number;
  awaiting: number;
}

export interface IdRow {
  id: number;
}

export interface CountRow {
  n: number;
}

export interface NumberRow {
  number: number;
}
