import { http } from '../../../shared/api/httpClient';

/** Endpoints públicos: não exigem conta. */
export const publicRaffleApi = {
  get: (slug) => http.get(`/api/r/${slug}`),
  reserve: (slug, { name, phone, numbers }) => http.post(`/api/r/${slug}/reserve`, { name, phone, numbers }),
  getOrder: (token) => http.get(`/api/pedido/${token}`),
};
