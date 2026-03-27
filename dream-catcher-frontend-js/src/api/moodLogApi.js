import { apiClient } from './client';

export const moodLogApi = {
  create: (request) =>
    apiClient.post('/api/v1/logs/mood', request).then((r) => r.data),

  getAll: () =>
    apiClient.get('/api/v1/logs/mood').then((r) => r.data),
};
