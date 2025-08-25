/**
 * Pattern validators for different AI providers
 * 
 * Provides fast, local pattern validation for API keys without making network requests.
 */

import { PatternValidationResult } from "@/types";

/**
 * Validate OpenAI API key pattern
 * 
 * OpenAI API keys follow the format: sk-[A-Za-z0-9]{48}
 * Total length: 51 characters (3 for "sk-" + 48 alphanumeric)
 * 
 * @param apiKey - The API key to validate
 * @returns Pattern validation result
 */
export function validateOpenAIKeyPattern(apiKey: string): PatternValidationResult {
  const startTime = performance.now();
  
  // Create base result object
  const createResult = (valid: boolean, message: string, errorCode?: PatternValidationResult["errorCode"]): PatternValidationResult => ({
    valid,
    message,
    errorCode,
    provider: "openai",
    responseTime: Math.round(performance.now() - startTime),
    timestamp: new Date(),
  });

  // Handle null, undefined, or non-string input
  if (apiKey == null || typeof apiKey !== "string") {
    return createResult(false, "OpenAI API keys must start with 'sk-'", "INVALID_PREFIX");
  }

  // Check prefix first (priority order: prefix -> length -> characters)
  if (!apiKey.startsWith("sk-")) {
    return createResult(false, "OpenAI API keys must start with 'sk-'", "INVALID_PREFIX");
  }

  // Check total length (should be exactly 51: "sk-" + 48 characters)
  if (apiKey.length !== 51) {
    return createResult(
      false, 
      "OpenAI API keys must be exactly 51 characters long (sk- + 48 characters)", 
      "INVALID_LENGTH"
    );
  }

  // Check characters in the key body (after "sk-")
  const keyBody = apiKey.slice(3); // Remove "sk-" prefix
  const validCharPattern = /^[A-Za-z0-9]{48}$/;
  
  if (!validCharPattern.test(keyBody)) {
    return createResult(
      false, 
      "OpenAI API keys can only contain alphanumeric characters (A-Z, a-z, 0-9)", 
      "INVALID_CHARACTERS"
    );
  }

  // All validations passed
  return createResult(true, "Valid OpenAI API key format");
}