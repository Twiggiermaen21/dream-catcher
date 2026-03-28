import { apiClient } from './client';

export const moodLogApi = {
  create: (request) =>
    apiClient.post('/api/v1/logs/mood', request).then((r) => r.data),

  getAll: () =>
    apiClient.get('/api/v1/logs/mood').then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/api/v1/logs/mood/${id}`),

  update: (id, request) =>
    apiClient.put(`/api/v1/logs/mood/${id}`, request).then((r) => r.data),
};
