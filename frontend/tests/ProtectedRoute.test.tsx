import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { AuthProvider } from '../src/contexts/AuthContext';
import { TOKEN_KEY, USER_KEY } from '../src/services/sessionStorage';

function Harness() {
  return (
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<div>PAGINA_LOGIN</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>DASHBOARD</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

function seedSession(): void {
  localStorage.setItem(TOKEN_KEY, 'token-de-prueba');
  localStorage.setItem(USER_KEY, JSON.stringify({ id: 'user-001', rut: '12.345.678-5', role: 'user' }));
}

describe('ProtectedRoute', () => {
  it('redirige a /login cuando no hay sesión', () => {
    render(<Harness />);
    expect(screen.getByText('PAGINA_LOGIN')).toBeInTheDocument();
    expect(screen.queryByText('DASHBOARD')).not.toBeInTheDocument();
  });

  it('permite acceder cuando existe una sesión válida', () => {
    seedSession();
    render(<Harness />);
    expect(screen.getByText('DASHBOARD')).toBeInTheDocument();
    expect(screen.queryByText('PAGINA_LOGIN')).not.toBeInTheDocument();
  });
});