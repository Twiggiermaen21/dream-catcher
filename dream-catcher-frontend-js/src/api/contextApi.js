import { apiClient } from './client';

export const contextApi = {
  getToday: (lat, lon) =>
    apiClient.get('/api/v1/context/today', { params: { lat, lon } }).then(r => r.data),

  getForDate: (date, lat, lon) =>
    apiClient.get('/api/v1/context/date', { params: { date, lat, lon } }).then(r => r.data),
};
