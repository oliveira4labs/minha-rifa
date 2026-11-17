/**
 * Pedido (reserva) de um ou mais números.
 * pending → paid | expired | cancelled; paid → cancelled.
 * Só pedidos `pending` e `paid` ocupam números.
 */
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

/** Número ocupado por um pedido ativo. */
export interface TakenNumber {
  number: number;
  status: 'pending' | 'paid';
  buyerName: string;
  buyerPhone: string;
}
