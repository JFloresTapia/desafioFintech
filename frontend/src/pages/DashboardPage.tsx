import { useState } from 'react';
import type { FormEvent } from 'react';
import { ErrorMessage } from '../components/ErrorMessage';
import { Navbar } from '../components/Navbar';
import { ScoreCard } from '../components/ScoreCard';
import { useAuth } from '../hooks/useAuth';
import { useScoreQuery } from '../hooks/useScoreQuery';
import { formatRutTyping, normalizeRut } from '../utils/rut';

export function DashboardPage() {
  const { session } = useAuth();
  const user = session?.user;
  const isAdmin = user?.role === 'admin';

  const [searchRut, setSearchRut] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const { result, error, loading, query } = useScoreQuery();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const input = isAdmin ? searchRut : (user?.rut ?? '');
    const normalized = normalizeRut(input);
    if (normalized === null) {
      setFieldError('El RUT no es válido.');
      return;
    }
    setFieldError(null);
    await query(normalized);
  };

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <section className="card" aria-label="Consulta de score">
          <h2>Consultar score de riesgo</h2>
          {fieldError !== null && <ErrorMessage message={fieldError} />}
          {error !== null && <ErrorMessage message={error} />}
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="score-rut-input">RUT</label>
              {isAdmin ? (
                <input
                  id="score-rut-input"
                  name="rut"
                  className="input"
                  type="text"
                  inputMode="numeric"
                  placeholder="11.111.111-1"
                  value={searchRut}
                  onChange={(event) => setSearchRut(formatRutTyping(event.target.value))}
                />
              ) : (
                <input
                  id="score-rut-input"
                  name="rut"
                  className="input"
                  type="text"
                  value={user?.rut ?? ''}
                  disabled
                />
              )}
            </div>
            {!isAdmin && (
              <p className="muted">
                Solo puedes consultar tu propio RUT. Esta restricción se aplica también en el
                backend.
              </p>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" aria-hidden="true" /> : null}
              {loading ? 'Consultando…' : 'Consultar'}
            </button>
          </form>
        </section>
        {result !== null && <ScoreCard result={result} />}
      </main>
    </>
  );
}