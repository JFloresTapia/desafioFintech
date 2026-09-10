import type { User } from '../domain/user.js';

/**
 * Abstracción del acceso a datos de usuarios. Las capas superiores (Service,
 * Controller) dependen de esta interfaz, no de la implementación concreta
 * (Dependency Inversion). Permite reemplazar el repositorio mock por uno de
 * base de datos sin tocar la lógica de negocio.
 */
export interface UserRepository {
  findByRut(rut: string): Promise<User | null>;
}