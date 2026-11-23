import { http } from '../../../shared/api/httpClient';

export const remoteConfigApi = {
  get: () => http.get('/api/config'),
};
