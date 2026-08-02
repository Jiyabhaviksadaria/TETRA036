'use client';

import { useState, useEffect, useCallback } from 'react';
import { rakshakApi, IncidentRecord } from '@/services/rakshakApi';

export function useTimeline(pollIntervalMs = 5000) {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await rakshakApi.getTimeline();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError('Backend unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetch, pollIntervalMs]);

  const recordAction = useCallback(
    async (id: string, action: 'accept' | 'ignore' | 'override') => {
      await rakshakApi.timelineAction(id, action);
      await fetch();
    },
    [fetch]
  );

  return { incidents, loading, error, refetch: fetch, recordAction };
}
