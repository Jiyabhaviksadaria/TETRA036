'use client';

import { useState, useCallback } from 'react';
import { rakshakApi, SimulationResult } from '@/services/rakshakApi';

export type ScenarioAnimal = 'Wild Boar' | 'Cow' | 'Nilgai' | 'Dog' | 'Human';

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(
    async (animal: ScenarioAnimal, time: 'Day' | 'Night' = 'Night') => {
      setLoading(true);
      setError(null);
      try {
        const data = await rakshakApi.simulate(animal, time);
        setResult(data);
        return data;
      } catch (err) {
        setError('Simulation failed — is the backend running?');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { result, loading, error, runSimulation };
}
