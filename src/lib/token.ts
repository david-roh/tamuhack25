/**
 * Generates a unique token for lost items
 * Format: random alphanumeric string (e.g., "b4nm3isohea477rvdcxiw")
 * @returns A unique token string
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
} 