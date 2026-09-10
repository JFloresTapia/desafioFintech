import type { User } from '../domain/user.js';

/**
 * Usuarios mock del MVP. Las contraseñas se guardan hasheadas con bcrypt
 * (nunca en texto plano). Hashes generados para:
 *   user-001  -> password "password"
 *   admin-001 -> password "admin123"
 *
 * Nota: "12.345.678-9" (ejemplo del enunciado) tiene un dígito verificador
 * inválido según el algoritmo oficial chileno; el DV correcto es "5".
 */
export const mockUsers: readonly User[] = [
  {
    id: 'user-001',
    rut: '12.345.678-5',
    passwordHash: '$2b$10$ED.zpk72G6UiNAD8UcE2ne5g7UuAFy9fo1QR0PGF98/S7ZXqyHnI2',
    role: 'user',
  },
  {
    id: 'admin-001',
    rut: '99.999.999-9',
    passwordHash: '$2b$10$xQNBJcZKxqw8xxFN9afhW.UC7Yf6KY8PfVmX/GfWrTvZEyPHOYxIS',
    role: 'admin',
  },
];