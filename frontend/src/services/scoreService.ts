import type { ScoreResponse } from '../types/score';
import { apiClient } from './apiClient';

export const scoreService = {
  getScore(rut: string): Promise<ScoreResponse> {
    return apiClient.request<ScoreResponse>(`/score/${encodeURIComponent(rut)}`);
  },
};