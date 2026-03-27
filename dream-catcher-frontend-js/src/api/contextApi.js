import { apiClient } from './client';

export const contextApi = {
  getToday: (lat, lon, zodiac) =>
    apiClient
      .get('/api/v1/context/today', { params: { lat, lon, zodiac } })
      .then((r) => r.data),

  getForDate: (date, lat, lon, zodiac) =>
    apiClient
      .get('/api/v1/context/date', { params: { date, lat, lon, zodiac } })
      .then((r) => r.data),
};
