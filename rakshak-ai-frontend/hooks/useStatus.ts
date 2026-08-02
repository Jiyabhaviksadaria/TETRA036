'use client';

import { useState, useEffect, useCallback } from 'react';
import { rakshakApi, FullStatus } from '@/services/rakshakApi';

const DEFAULT_STATUS: FullStatus = {
  threat_level: 'NONE',
  recommendation: 'Monitor',
  reason: [],
  animal: '',
  confidence: 0,
  timestamp: '',
  system_state: {
    farm_status: 'SAFE',
    system: 'ACTIVE',
    camera: 'STANDBY',
    motion: 'WAITING',
    ai: 'READY',
    alert: 'STANDBY',
  },
  active_scenario: null,
};

export function useStatus(pollIntervalMs = 3000) {
  const [status, setStatus] = useState<FullStatus>(DEFAULT_STATUS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      const data = await rakshakApi.getStatus();
      setStatus(data);
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

  return { status, loading, error, refetch: fetch };
}
