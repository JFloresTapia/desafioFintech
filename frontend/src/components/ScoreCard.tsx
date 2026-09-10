import type { ScoreResponse } from '../types/score';

function scoreLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function scoreLabel(score: number): string {
  const level = scoreLevel(score);
  if (level === 'high') return 'Riesgo alto';
  if (level === 'medium') return 'Riesgo medio';
  return 'Riesgo bajo';
}

export function ScoreCard({ result }: { result: ScoreResponse }) {
  const date = new Date(result.fecha);
  const level = scoreLevel(result.score);

  return (
    <section className="card score-card" aria-label="Resultado del score de riesgo">
      <p className="muted">RUT consultado</p>
      <p className="score-rut" data-testid="score-rut">
        {result.rut}
      </p>
      <p className={`score-value score-${level}`} data-testid="score-value">
        {result.score}
      </p>
      <p className="score-label">{scoreLabel(result.score)}</p>
      <p className="muted" data-testid="score-fecha">
        {Number.isNaN(date.getTime()) ? result.fecha : date.toLocaleString('es-CL')}
      </p>
    </section>
  );
}