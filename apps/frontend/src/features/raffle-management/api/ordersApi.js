import { http } from '../../../shared/api/httpClient';

export const ordersApi = {
  approve: (orderId) => http.post(`/api/orders/${orderId}/approve`),
  cancel: (orderId) => http.post(`/api/orders/${orderId}/cancel`),
};
