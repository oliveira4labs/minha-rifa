import type { Order, OrderStatus } from '../interfaces/order.interface.js';

export const AWAITING_BUYER_STATUSES: readonly OrderStatus[] = ['held', 'pending'];

export const MANAGEABLE_STATUSES: readonly OrderStatus[] = ['pending', 'proof_sent', 'paid'];

export const isAwaitingBuyer = (order: Order, now = Date.now()): boolean =>
  AWAITING_BUYER_STATUSES.includes(order.status) && order.expiresAt > now;

export const canApprove = (order: Order): boolean => order.status === 'pending' || order.status === 'proof_sent';
