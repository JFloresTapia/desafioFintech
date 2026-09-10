import bcrypt from 'bcryptjs';

export function hashPassword(plainText: string, cost = 10): Promise<string> {
  return bcrypt.hash(plainText, cost);
}

export function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}