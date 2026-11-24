import { http } from '../../../shared/api/httpClient';

export const GOOGLE_LOGIN_URL = '/api/auth/google';

export const authApi = {
  me: () => http.get('/api/me').then((r) => r.user),
  logout: () => http.post('/api/logout'),
};
