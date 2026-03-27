import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

// Przy starcie aplikacji wczytaj token z localStorage jeśli istnieje
const stored = localStorage.getItem('dream-catcher-auth');
if (stored) {
  try {
    const { state } = JSON.parse(stored);
    if (state?.token) {
      apiClient.defaults.headers['Authorization'] = `Bearer ${state.token}`;
    }
  } catch {}
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dream-catcher-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
