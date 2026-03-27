import { useState, useEffect } from 'react';
import { contextApi } from '../api/contextApi';

const DEFAULT_LOCATION = { lat: 52.23, lon: 21.01 }; // Warszawa

export function useDailyContext(zodiacSign) {
  const [context, setContext]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!zodiacSign) return;

    setLoading(true);
    setError(null);

    // Próbuje pobrać lokalizację użytkownika, fallback na Warszawę
    const fetchContext = (lat, lon) =>
      contextApi
        .getToday(lat, lon, zodiacSign)
        .then(setContext)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchContext(pos.coords.latitude, pos.coords.longitude),
        ()    => fetchContext(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon)
      );
    } else {
      fetchContext(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    }
  }, [zodiacSign]);

  return { context, loading, error };
}
