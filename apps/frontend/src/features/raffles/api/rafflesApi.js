import { http } from '../../../shared/api/httpClient';

export const rafflesApi = {
  list: () => http.get('/api/raffles'),
  get: (id) => http.get(`/api/raffles/${id}`),
  create: (payload) => http.post('/api/raffles', payload),
  update: (id, payload) => http.put(`/api/raffles/${id}`, payload),
  remove: (id) => http.delete(`/api/raffles/${id}`),
  draw: (id) => http.post(`/api/raffles/${id}/draw`),
};
