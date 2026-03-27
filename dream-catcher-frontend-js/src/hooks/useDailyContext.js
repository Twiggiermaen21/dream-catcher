import { useState, useEffect } from 'react';
import { contextApi } from '../api/contextApi';

const DEFAULT_LOC = { lat: 52.23, lon: 21.01 };

export function useDailyContext() {
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetch = (lat, lon) =>
      contextApi.getToday(lat, lon)
        .then(setContext)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetch(pos.coords.latitude, pos.coords.longitude),
        ()   => fetch(DEFAULT_LOC.lat, DEFAULT_LOC.lon)
      );
    } else {
      fetch(DEFAULT_LOC.lat, DEFAULT_LOC.lon);
    }
  }, []);

  return { context, loading, error };
}
