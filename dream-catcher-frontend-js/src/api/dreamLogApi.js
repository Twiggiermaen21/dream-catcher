import { apiClient } from './client';

export const dreamLogApi = {
  create: (request) =>
    apiClient.post('/api/v1/logs/dreams', request).then((r) => r.data),

  getAll: () =>
    apiClient.get('/api/v1/logs/dreams').then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/api/v1/logs/dreams/${id}`),

  update: (id, request) =>
    apiClient.put(`/api/v1/logs/dreams/${id}`, request).then((r) => r.data),
};
