export type OrderStatus = 'pending' | 'paid' | 'expired' | 'cancelled';

export interface Order {
  id: number;
  raffleId: number;
  token: string;
  buyerName: string;
  buyerPhone: string;
  numbers: number[];
  status: OrderStatus;
  createdAt: number;
  expiresAt: number;
  paidAt: number | null;
}

export type NewOrder = Omit<Order, 'id' | 'status' | 'paidAt'>;

export interface TakenNumber {
  number: number;
  status: 'pending' | 'paid';
  buyerName: string;
  buyerPhone: string;
}
