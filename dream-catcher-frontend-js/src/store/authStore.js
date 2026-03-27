import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const { data } = await apiClient.post('/api/v1/auth/login', { email, password });
        apiClient.defaults.headers['Authorization'] = `Bearer ${data.token}`;
        set({ token: data.token, user: { displayName: data.displayName, role: data.role, userId: data.userId } });
      },

      register: async (email, password, displayName) => {
        const { data } = await apiClient.post('/api/v1/auth/register', { email, password, displayName });
        apiClient.defaults.headers['Authorization'] = `Bearer ${data.token}`;
        set({ token: data.token, user: { displayName: data.displayName, role: data.role, userId: data.userId } });
      },

      logout: () => {
        delete apiClient.defaults.headers['Authorization'];
        set({ token: null, user: null });
      },
    }),
    { name: 'dream-catcher-auth' }
  )
);
