/**
 * Generates a unique token for lost items
 * @returns A unique token string
 */
export function generateToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
} 