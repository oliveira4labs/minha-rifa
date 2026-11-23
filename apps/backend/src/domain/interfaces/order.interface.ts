export type OrderStatus = 'held' | 'pending' | 'proof_sent' | 'paid' | 'expired' | 'cancelled';

export type ReleaseStatus = 'cancelled' | 'expired';

export interface Order {
  id: number;
  raffleId: number;
  token: string;
  buyerName: string | null;
  buyerPhone: string | null;
  numbers: number[];
  status: OrderStatus;
  createdAt: number;
  expiresAt: number;
  proofSentAt: number | null;
  paidAt: number | null;
}

export type NewHeldOrder = Pick<Order, 'raffleId' | 'token' | 'numbers' | 'createdAt' | 'expiresAt'>;

export interface TakenNumber {
  number: number;
  status: OrderStatus;
  buyerName: string | null;
  buyerPhone: string | null;
}
