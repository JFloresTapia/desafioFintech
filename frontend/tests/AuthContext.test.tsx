import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, AuthProvider } from '../src/contexts/AuthContext';
import { UNAUTHORIZED_EVENT } from '../src/services/apiClient';
import { authService } from '../src/services/authService';
import { TOKEN_KEY, USER_KEY } from '../src/services/sessionStorage';
import { useContext } from 'react';

vi.mock('../src/services/authService', () => ({ authService: { login: vi.fn() } }));

const mockedLogin = vi.mocked(authService.login);

function Probe() {
  const context = useContext(AuthContext);
  return (
    <div>
      <span data-testid="isAuthenticated">{context?.isAuthenticated ? 'si' : 'no'}</span>
      <span data-testid="sessionMessage">{context?.sessionMessage ?? ''}</span>
      <button type="button" onClick={() => context?.login('12.345.678-5', 'password')}>
        login
      </button>
      <button type="button" onClick={() => context?.logout()}>
        logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it('restaura la sesión desde localStorage al montar', () => {
    localStorage.setItem(TOKEN_KEY, 'token-x');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 'user-001', rut: '12.345.678-5', role: 'user' }));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('si');
  });

  it('ignora una sesión corrupta en localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'token-x');
    localStorage.setItem(USER_KEY, '{no-json');

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('no');
  });

  it('al hacer login persiste la sesión y actualiza el estado', async () => {
    mockedLogin.mockResolvedValue({
      token: 'token-nuevo',
      expiresIn: '1h',
      user: { id: 'user-001', rut: '12.345.678-5', role: 'user' },
    });
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await user.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('si'));
    expect(localStorage.getItem(TOKEN_KEY)).toBe('token-nuevo');
    expect(screen.getByTestId('sessionMessage')).toHaveTextContent('');
  });

  it('al recibir un evento de no autorizado limpia la sesión y muestra mensaje', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-x');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 'user-001', rut: '12.345.678-5', role: 'user' }));

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));

    await waitFor(() => expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('no'));
    expect(screen.getByTestId('sessionMessage')).toHaveTextContent(/sesión ha expirado/i);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('al hacer logout limpia la sesión', async () => {
    localStorage.setItem(TOKEN_KEY, 'token-x');
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 'user-001', rut: '12.345.678-5', role: 'user' }));

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await user.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('no'));
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});