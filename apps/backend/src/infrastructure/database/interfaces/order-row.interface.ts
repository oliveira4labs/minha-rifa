import type { OrderStatus } from '../../../domain/interfaces/order.interface.js';

export interface OrderRow {
  id: number;
  raffle_id: number;
  token: string;
  buyer_name: string;
  buyer_phone: string;
  numbers: number[];
  status: OrderStatus;
  created_at: number;
  expires_at: number;
  paid_at: number | null;
}

export interface TakenNumberRow {
  number: number;
  status: 'pending' | 'paid';
  buyer_name: string;
  buyer_phone: string;
}

export interface NumberCountsRow {
  paid: number;
  pending: number;
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
