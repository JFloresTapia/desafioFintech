import { describe, expect, it } from 'vitest';
import { MockUserRepository } from '../../src/repositories/mock-user.repository.js';
import { mockUsers } from '../../src/data/mock-users.js';

describe('MockUserRepository', () => {
  const repository = new MockUserRepository(mockUsers);

  it('encuentra un usuario por su RUT canónico', async () => {
    const user = await repository.findByRut('12.345.678-5');
    expect(user?.id).toBe('user-001');
    expect(user?.role).toBe('user');
  });

  it('normaliza antes de buscar', async () => {
    const user = await repository.findByRut('123456785');
    expect(user?.id).toBe('user-001');
  });

  it('retorna null para un RUT que no existe', async () => {
    expect(await repository.findByRut('11.111.111-1')).toBeNull();
  });

  it('retorna null para un RUT inválido', async () => {
    expect(await repository.findByRut('12.345.678-9')).toBeNull();
  });
});