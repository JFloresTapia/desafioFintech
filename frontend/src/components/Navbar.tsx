import { useAuth } from '../hooks/useAuth';

export function Navbar() {
  const { session, logout } = useAuth();
  const user = session?.user;

  return (
    <header className="navbar">
      <div>
        <span className="navbar-brand">Fintech</span>
        <span className="muted">Score de Riesgo Financiero</span>
      </div>
      <div className="navbar-user">
        <span>{user?.rut}</span>
        <span className={`badge badge-${user?.role ?? 'user'}`}>{user?.role}</span>
        <button type="button" onClick={() => logout()} className="btn btn-secondary">
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}