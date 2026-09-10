import type { LoginResponse } from '../types/auth';
import { apiClient } from './apiClient';

export const authService = {
  login(rut: string, password: string): Promise<LoginResponse> {
    return apiClient.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ rut, password }),
    });
  },
};