const DV_SERIES: readonly number[] = [2, 3, 4, 5, 6, 7];

function digitWeight(offsetFromRight: number): number {
  return DV_SERIES[offsetFromRight % DV_SERIES.length] ?? 2;
}

function groupThousands(bodyDigits: string): string {
  return bodyDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function calculateDv(bodyDigits: string): string {
  let sum = 0;
  for (let i = bodyDigits.length - 1, offset = 0; i >= 0; i -= 1, offset += 1) {
    sum += Number(bodyDigits[i]) * digitWeight(offset);
  }
  const dv = 11 - (sum % 11);
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return String(dv);
}

/**
 * Normaliza un RUT a su forma canónica "12.345.678-5".
 * La validación de dígito verificador en el frontend es solo para UX:
 * la fuente de verdad es el backend.
 */
export function normalizeRut(input: string): string | null {
  const raw = input.trim().toUpperCase().replace(/\./g, '');
  if (!/^\d{1,8}-?[\dkK]$/.test(raw)) return null;
  const body = raw.replace(/[-\dkK]$/, '').replace('-', '');
  const dv = raw.slice(-1);
  if (calculateDv(body) !== dv) return null;
  return `${groupThousands(body)}-${dv}`;
}

export function isValidRut(input: string): boolean {
  return normalizeRut(input) !== null;
}

/** Formatea en vivo mientras se escribe: "12345678" -> "12.345.678-" */
export function formatRutTyping(input: string): string {
  const clean = input.replace(/[^0-9kK]/g, '').toUpperCase();
  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);
  if (body.length === 0) return dv;
  return `${groupThousands(body)}-${dv}`;
}