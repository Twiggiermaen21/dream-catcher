import { apiClient } from './client';

export const sleepLogApi = {
  create: (request) =>
    apiClient.post('/api/v1/logs/sleep', request).then((r) => r.data),

  getAll: () =>
    apiClient.get('/api/v1/logs/sleep').then((r) => r.data),
};
