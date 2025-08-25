/**
 * Cryptographic Utilities
 * 
 * Provides secure cryptographic operations for key validation.
 */

import { createHash, randomBytes } from 'crypto';

export class CryptoUtils {
  /**
   * Create a secure hash of sensitive data for comparison
   */
  static createSecureHash(data: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString('hex');
    const hash = createHash('sha256');
    hash.update(data + actualSalt);
    return hash.digest('hex');
  }

  /**
   * Generate a secure random string for nonces or temporary tokens
   */
  static generateSecureRandom(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Mask sensitive data for safe logging
   */
  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars * 2) {
      return '*'.repeat(data.length);
    }

    const start = data.slice(0, visibleChars);
    const end = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - (visibleChars * 2));
    
    return start + masked + end;
  }
}