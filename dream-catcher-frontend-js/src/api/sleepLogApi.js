import { apiClient } from './client';

export const sleepLogApi = {
  create: (request) =>
    apiClient.post('/api/v1/logs/sleep', request).then((r) => r.data),

  getAll: () =>
    apiClient.get('/api/v1/logs/sleep').then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/api/v1/logs/sleep/${id}`),

  update: (id, request) =>
    apiClient.put(`/api/v1/logs/sleep/${id}`, request).then((r) => r.data),
};
