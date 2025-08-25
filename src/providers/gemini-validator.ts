/**
 * Gemini API Key Pattern Validator
 * 
 * Provides pattern validation for Google Gemini API keys without making network requests.
 * Implements User Story US-003 acceptance criteria.
 */

import { PatternValidationResult } from "../types";

/**
 * Validate Gemini API key format pattern
 * 
 * Google Gemini API keys follow the format:
 * - Prefix: "AIza" (case-sensitive)
 * - Total length: 39 characters
 * - Character set: alphanumeric, hyphens, and underscores
 * 
 * @param apiKey - The API key to validate
 * @returns PatternValidationResult with validation status and details
 */
export function validateGeminiPattern(apiKey: string): PatternValidationResult {
  const startTime = Date.now();
  
  try {
    // Handle null/undefined input
    if (apiKey === null || apiKey === undefined) {
      return {
        valid: false,
        errorCode: "INVALID_FORMAT",
        message: "Invalid input: API key cannot be null or undefined",
        provider: "gemini",
        validationTime: Date.now() - startTime,
      };
    }

    // Trim whitespace
    const trimmedKey = String(apiKey).trim();

    // Check length first (most efficient check)
    if (trimmedKey.length !== 39) {
      return {
        valid: false,
        errorCode: "INVALID_LENGTH",
        message: `Invalid Gemini API key length. Expected 39 characters, got ${trimmedKey.length}`,
        provider: "gemini",
        validationTime: Date.now() - startTime,
      };
    }

    // Check prefix format (case-sensitive)
    if (!trimmedKey.startsWith("AIza")) {
      return {
        valid: false,
        errorCode: "INVALID_FORMAT",
        message: "Invalid Gemini API key format. Expected format: AIza[35 characters]",
        provider: "gemini",
        validationTime: Date.now() - startTime,
      };
    }

    // Check character validity (alphanumeric, hyphens, underscores only)
    const allowedCharPattern = /^[a-zA-Z0-9_-]+$/;
    if (!allowedCharPattern.test(trimmedKey)) {
      return {
        valid: false,
        errorCode: "INVALID_CHARACTERS",
        message: "Invalid characters in Gemini API key. Only alphanumeric characters, hyphens, and underscores are allowed",
        provider: "gemini",
        validationTime: Date.now() - startTime,
      };
    }

    // All checks passed
    return {
      valid: true,
      message: "Valid Gemini API key format",
      provider: "gemini",
      validationTime: Date.now() - startTime,
    };

  } catch (error) {
    // Handle any unexpected errors
    return {
      valid: false,
      errorCode: "INVALID_FORMAT",
      message: "Unexpected error during validation",
      provider: "gemini",
      validationTime: Date.now() - startTime,
    };
  }
}

/**
 * Get Gemini API key format information
 * 
 * @returns Object with format specifications
 */
export function getGeminiKeyFormat() {
  return {
    prefix: "AIza",
    totalLength: 39,
    suffixLength: 35,
    allowedCharacters: "alphanumeric, hyphens, and underscores",
    pattern: /^AIza[a-zA-Z0-9_-]{35}$/,
    example: "AIza***********************************", // Masked example
    description: "Google Gemini API keys start with 'AIza' followed by 35 alphanumeric characters, hyphens, or underscores"
  };
}