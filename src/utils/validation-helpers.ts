/**
 * Validation Helper Functions
 * 
 * Common validation utilities used across the application.
 */

export class ValidationHelpers {
  /**
   * Check if a string matches expected API key patterns
   */
  static matchesKeyPattern(key: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      const regex = new RegExp(pattern.replace('*', '.*'), 'i');
      return regex.test(key);
    });
  }

  /**
   * Extract provider type from API key format
   */
  static detectProvider(apiKey: string): string | null {
    if (apiKey.startsWith('sk-proj-') || apiKey.startsWith('sk-')) {
      return 'openai';
    }
    
    if (apiKey.startsWith('sk-ant-')) {
      return 'claude';
    }
    
    if (apiKey.startsWith('AIza')) {
      return 'gemini';
    }

    return null;
  }

  /**
   * Validate URL format for endpoints
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a value is a non-empty string
   */
  static isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}