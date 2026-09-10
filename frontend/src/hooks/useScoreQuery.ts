import { useCallback, useState } from 'react';
import type { ScoreResponse } from '../types/score';
import { scoreService } from '../services/scoreService';
import { describeError } from '../utils/errors';

interface ScoreQueryState {
  result: ScoreResponse | null;
  error: string | null;
  loading: boolean;
  query: (rut: string) => Promise<void>;
  clear: () => void;
}

export function useScoreQuery(): ScoreQueryState {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const query = useCallback(async (rut: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await scoreService.getScore(rut);
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, error, loading, query, clear };
}