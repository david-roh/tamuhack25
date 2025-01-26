/**
 * Generates a random token for QR codes
 * @returns A unique token string
 */
export function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
} 