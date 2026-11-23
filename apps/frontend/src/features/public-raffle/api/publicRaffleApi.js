import { http } from '../../../shared/api/httpClient';

export const publicRaffleApi = {
  get: (slug) => http.get(`/api/r/${slug}`),
  hold: (slug, { token, number }) => http.post(`/api/r/${slug}/hold`, { token: token ?? '', number }),
  release: (slug, { token, number }) => http.post(`/api/r/${slug}/release`, { token, number }),
  reserve: (slug, { token, name, phone }) => http.post(`/api/r/${slug}/reserve`, { token, name, phone }),
  getOrder: (token) => http.get(`/api/pedido/${token}`),
  proofSent: (token) => http.post(`/api/pedido/${token}/comprovante`, undefined, { keepalive: true }),
};
