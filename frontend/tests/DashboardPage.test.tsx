import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import { DashboardPage } from '../src/pages/DashboardPage';
import { scoreService } from '../src/services/scoreService';
import { ApiClientError } from '../src/services/apiClient';
import { TOKEN_KEY, USER_KEY } from '../src/services/sessionStorage';
import type { AuthUser, Session } from '../src/types/auth';
import type { ScoreResponse } from '../src/types/score';

vi.mock('../src/services/scoreService', () => ({ scoreService: { getScore: vi.fn() } }));

const mockedGetScore = vi.mocked(scoreService.getScore);

function seedSession(user: AuthUser): void {
  const session: Session = { token: 'token-de-prueba', user };
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

function renderDashboard(): void {
  render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

const sampleScore: ScoreResponse = {
  rut: '12.345.678-5',
  score: 33,
  fecha: '2026-09-09T14:35:00.000Z',
};

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedGetScore.mockReset();
  });

  it('como user muestra su propio RUT (no editable) y consulta su score', async () => {
    seedSession({ id: 'user-001', rut: '12.345.678-5', role: 'user' });
    mockedGetScore.mockResolvedValue(sampleScore);
    const user = userEvent.setup();
    renderDashboard();

    const rutInput = screen.getByLabelText(/^RUT$/i) as HTMLInputElement;
    expect(rutInput).toBeDisabled();
    expect(rutInput.value).toBe('12.345.678-5');

    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(mockedGetScore).toHaveBeenCalledWith('12.345.678-5');
    expect(await screen.findByTestId('score-value')).toHaveTextContent('33');
    expect(screen.getByTestId('score-rut')).toHaveTextContent('12.345.678-5');
  });

  it('como admin permite consultar cualquier RUT', async () => {
    seedSession({ id: 'admin-001', rut: '99.999.999-9', role: 'admin' });
    mockedGetScore.mockResolvedValue({ ...sampleScore, rut: '11.111.111-1', score: 84 });
    const user = userEvent.setup();
    renderDashboard();

    const rutInput = screen.getByLabelText(/^RUT$/i) as HTMLInputElement;
    expect(rutInput).toBeEnabled();

    fireEvent.change(rutInput, { target: { value: '11.111.111-1' } });
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(mockedGetScore).toHaveBeenCalledWith('11.111.111-1');
    expect(await screen.findByTestId('score-value')).toHaveTextContent('84');
  });

  it('muestra el mensaje de error cuando la API responde 403', async () => {
    seedSession({ id: 'admin-001', rut: '99.999.999-9', role: 'admin' });
    mockedGetScore.mockRejectedValue(new ApiClientError(403, 'Sin permisos'));
    const user = userEvent.setup();
    renderDashboard();

    fireEvent.change(screen.getByLabelText(/^RUT$/i), { target: { value: '11.111.111-1' } });
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(await screen.findByText(/no tienes permisos para consultar este RUT/i)).toBeInTheDocument();
  });

  it('valida el RUT ingresado por el admin antes de consultar', async () => {
    seedSession({ id: 'admin-001', rut: '99.999.999-9', role: 'admin' });
    const user = userEvent.setup();
    renderDashboard();

    fireEvent.change(screen.getByLabelText(/^RUT$/i), { target: { value: 'no-es-un-rut' } });
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(await screen.findByText(/RUT no es válido/i)).toBeInTheDocument();
    expect(mockedGetScore).not.toHaveBeenCalled();
  });
});