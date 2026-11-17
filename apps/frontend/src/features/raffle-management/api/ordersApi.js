import { http } from '../../../shared/api/httpClient';

/** Ações do administrador sobre os pedidos (reservas) de uma rifa. */
export const ordersApi = {
  approve: (orderId) => http.post(`/api/orders/${orderId}/approve`),
  cancel: (orderId) => http.post(`/api/orders/${orderId}/cancel`),
};
