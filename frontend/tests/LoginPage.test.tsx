import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LoginPage } from '../src/pages/LoginPage';
import { authService } from '../src/services/authService';
import { ApiClientError } from '../src/services/apiClient';
import type { LoginResponse } from '../src/types/auth';

vi.mock('../src/services/authService', () => ({ authService: { login: vi.fn() } }));

const mockedLogin = vi.mocked(authService.login);

function Harness() {
  return (
    <AuthProvider>
      <MemoryRouter initialEntries={[{ pathname: '/login' }]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>DASHBOARD_OK</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

const sampleResponse: LoginResponse = {
  token: 'token-de-prueba',
  expiresIn: '1h',
  user: { id: 'user-001', rut: '12.345.678-5', role: 'user' },
};

describe('LoginPage', () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it('muestra los campos de RUT y contraseña', () => {
    render(<Harness />);
    expect(screen.getByLabelText(/^RUT$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('rechaza un RUT inválido sin llamar a la API', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText(/contraseña/i), 'password');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText(/RUT no es válido/i)).toBeInTheDocument();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('muestra un mensaje apropiado cuando las credenciales son incorrectas', async () => {
    mockedLogin.mockRejectedValue(new ApiClientError(401, 'Credenciales inválidas'));
    const user = userEvent.setup();
    render(<Harness />);

    fireEvent.change(screen.getByLabelText(/^RUT$/i), { target: { value: '12.345.678-5' } });
    await user.type(screen.getByLabelText(/contraseña/i), 'clave-mala');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByText(/no estás autenticado o tu sesión expiró/i)).toBeInTheDocument();
    expect(mockedLogin).toHaveBeenCalledWith('12.345.678-5', 'clave-mala');
  });

  it('inicia sesión, persiste la sesión y navega al dashboard', async () => {
    mockedLogin.mockResolvedValue(sampleResponse);
    const user = userEvent.setup();
    render(<Harness />);

    fireEvent.change(screen.getByLabelText(/^RUT$/i), { target: { value: '12.345.678-5' } });
    await user.type(screen.getByLabelText(/contraseña/i), 'password');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => expect(screen.queryByText('DASHBOARD_OK')).toBeInTheDocument());
    expect(mockedLogin).toHaveBeenCalledWith('12.345.678-5', 'password');
    expect(localStorage.getItem('pp_token')).toBe('token-de-prueba');
  });
});