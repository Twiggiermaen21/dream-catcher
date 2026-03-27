import { useState, useEffect } from 'react';
import { insightsApi } from '../api/insightsApi';

export function useInsights(periodDays = 30) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    insightsApi
      .getCorrelations(periodDays)
      .then(setInsights)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [periodDays]);

  return { insights, loading, error };
}
