const DV_SERIES: readonly number[] = [2, 3, 4, 5, 6, 7];

function digitWeight(offsetFromRight: number): number {
  return DV_SERIES[offsetFromRight % DV_SERIES.length] ?? 2;
}

/**
 * Calcula el dígito verificador chileno (módulo 11) para el cuerpo numérico del RUT.
 * Retorna "0", "K" o un dígito del 1 al 9.
 */
export function calculateDv(bodyDigits: string): string {
  let sum = 0;
  for (let i = bodyDigits.length - 1, offset = 0; i >= 0; i -= 1, offset += 1) {
    const digit = Number(bodyDigits[i]);
    sum += digit * digitWeight(offset);
  }
  const dv = 11 - (sum % 11);
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return String(dv);
}

function formatRut(bodyDigits: string, dv: string): string {
  const grouped = bodyDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped}-${dv}`;
}

/**
 * Normaliza un RUT a su forma canónica "12.345.678-5".
 * Acepta "12.345.678-5", "12345678-5", "123456785", con o sin puntos y guión.
 * Valida el dígito verificador. Retorna null si el RUT es inválido.
 */
export function normalizeRut(rut: unknown): string | null {
  if (typeof rut !== 'string') return null;
  const raw = rut.trim().toUpperCase().replace(/\./g, '');
  if (!/^\d{1,8}-?[\dkK]$/.test(raw)) return null;
  const body = raw.replace(/[-\dkK]$/, '').replace('-', '');
  const dv = raw.slice(-1);
  if (calculateDv(body) !== dv) return null;
  return formatRut(body, dv);
}