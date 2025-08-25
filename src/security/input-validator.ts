/**
 * Input Validation and Sanitization
 * 
 * Provides secure input validation for API keys and user input.
 */

export class InputValidator {
  private static readonly ALLOWED_KEY_CHARS = /^[a-zA-Z0-9\-_\.]+$/;
  private static readonly MAX_KEY_LENGTH = 512;
  private static readonly MIN_KEY_LENGTH = 8;

  /**
   * Validate API key format and safety
   */
  static validateApiKey(apiKey: string): ValidationResult {
    if (!apiKey || typeof apiKey !== 'string') {
      return { isValid: false, error: 'API key must be a non-empty string' };
    }

    if (apiKey.length < this.MIN_KEY_LENGTH) {
      return { isValid: false, error: 'API key is too short' };
    }

    if (apiKey.length > this.MAX_KEY_LENGTH) {
      return { isValid: false, error: 'API key is too long' };
    }

    if (!this.ALLOWED_KEY_CHARS.test(apiKey)) {
      return { isValid: false, error: 'API key contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Sanitize user input for safe processing
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}