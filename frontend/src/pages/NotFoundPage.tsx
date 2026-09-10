import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="page">
      <section className="card login-card">
        <h1>404</h1>
        <p className="muted">La página que buscas no existe.</p>
        <Link className="btn btn-primary" to="/dashboard">
          Ir al inicio
        </Link>
      </section>
    </main>
  );
}