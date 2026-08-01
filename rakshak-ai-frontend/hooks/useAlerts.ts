'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/types/alert';
import { alertService } from '@/services/alertService';

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    alertService.getAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  return { alerts, loading };
}
