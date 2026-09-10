import { useState } from 'react';
import type { FormEvent } from 'react';
import { formatRutTyping, normalizeRut } from '../utils/rut';
import { ErrorMessage } from './ErrorMessage';

interface LoginFormProps {
  onLogin: (rut: string, password: string) => Promise<void>;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const normalized = normalizeRut(rut);
    if (normalized === null) {
      setFieldError('El RUT no es válido. Usa el formato 12.345.678-5.');
      return;
    }
    if (password === '') {
      setFieldError('La contraseña es obligatoria.');
      return;
    }
    setFieldError(null);
    setSubmitting(true);
    try {
      await onLogin(normalized, password);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {fieldError !== null && <ErrorMessage message={fieldError} />}
      <div className="field">
        <label htmlFor="rut">RUT</label>
        <input
          id="rut"
          name="rut"
          className="input"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          placeholder="12.345.678-5"
          value={rut}
          onChange={(event) => setRut(formatRutTyping(event.target.value))}
        />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? <span className="spinner" aria-hidden="true" /> : null}
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}