import { http } from '../../../shared/api/httpClient';

export const authApi = {
  me: () => http.get('/api/me').then((r) => r.user),
  login: ({ email, password }) => http.post('/api/login', { email, password }),
  register: ({ name, email, password }) => http.post('/api/register', { name, email, password }),
  logout: () => http.post('/api/logout'),
};
