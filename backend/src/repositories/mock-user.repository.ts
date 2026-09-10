import type { User } from '../domain/user.js';
import type { UserRepository } from './user.repository.js';
import { normalizeRut } from '../utils/rut-utils.js';

export class MockUserRepository implements UserRepository {
  private readonly users: readonly User[];

  constructor(users: readonly User[]) {
    this.users = users;
  }

  async findByRut(rut: string): Promise<User | null> {
    const normalized = normalizeRut(rut);
    if (normalized === null) return null;
    return this.users.find((user) => user.rut === normalized) ?? null;
  }
}