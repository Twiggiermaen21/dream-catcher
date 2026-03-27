import { apiClient } from './client';

export const insightsApi = {
  getCorrelations: (periodDays = 30) =>
    apiClient
      .get('/api/v1/insights/correlations', { params: { periodDays } })
      .then((r) => r.data),
};
