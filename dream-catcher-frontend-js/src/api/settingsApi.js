import { apiClient } from './client';

export const settingsApi = {
  requestEmailChange: (newEmail) =>
    apiClient.post('/api/v1/settings/request-email-change', { newEmail }),

  requestPasswordChange: (currentPassword, newPassword) =>
    apiClient.post('/api/v1/settings/request-password-change', { currentPassword, newPassword }),
};
