import { apiClient } from './client';

export const dreamLogApi = {
  create: (request) =>
    apiClient.post('/api/v1/logs/dreams', request).then((r) => r.data),

  getAll: () =>
    apiClient.get('/api/v1/logs/dreams').then((r) => r.data),
};
