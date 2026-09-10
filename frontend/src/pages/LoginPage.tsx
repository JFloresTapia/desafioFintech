import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { describeError } from '../utils/errors';

export function LoginPage() {
  const { isAuthenticated, login, sessionMessage } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (rut: string, password: string): Promise<void> => {
    setError(null);
    try {
      await login(rut, password);
    } catch (err) {
      setError(describeError(err));
    }
  };

  return (
    <main className="page">
      <section className="card login-card">
        <h1>Fintech</h1>
        <p className="muted">Consulta de score de riesgo financiero</p>
        {sessionMessage !== null && <ErrorMessage message={sessionMessage} />}
        <LoginForm onLogin={handleLogin} />
        <ErrorMessage message={error} />
      </section>
    </main>
  );
}