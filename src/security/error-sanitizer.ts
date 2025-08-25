/**
 * Error Message Sanitization
 * 
 * Ensures error messages don't leak sensitive information.
 */

export class ErrorSanitizer {
  private static readonly SENSITIVE_PATTERNS = [
    /sk-[a-zA-Z0-9\-_]+/gi,        // OpenAI keys
    /sk-ant-[a-zA-Z0-9\-_]+/gi,    // Claude keys  
    /AIza[a-zA-Z0-9\-_]+/gi,       // Google API keys
    /Bearer\s+[a-zA-Z0-9\-_\.]+/gi, // Bearer tokens
    /password|pwd|secret|token/gi   // Common sensitive keywords
  ];

  /**
   * Sanitize error messages to remove sensitive data
   */
  static sanitize(error: Error | string): string {
    const message = typeof error === 'string' ? error : error.message;
    
    let sanitized = message;
    
    // Replace sensitive patterns with placeholders
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * Create a safe error object for logging or user display
   */
  static createSafeError(error: Error, userMessage?: string): Error {
    const safeMessage = userMessage || this.sanitize(error.message);
    const safeError = new Error(safeMessage);
    safeError.name = error.name;
    
    return safeError;
  }
}