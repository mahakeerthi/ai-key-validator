/**
 * Anthropic (Claude) API Key Provider
 * 
 * Handles pattern validation and API validation for Anthropic API keys.
 * Format: sk-ant-[A-Za-z0-9\-_]{95}
 */

import {
  IProviderPlugin,
  ProviderType,
  ValidationResult,
  ValidationOptions,
  RateLimitConfig,
  KeyFormatInfo,
  PatternValidationResult,
} from "../types";

export class AnthropicProvider implements IProviderPlugin {
  public readonly name: ProviderType = "claude";
  public readonly displayName: string = "Anthropic Claude";
  public readonly website: string = "https://www.anthropic.com/";

  private readonly PATTERN_REGEX = /^sk-ant-[A-Za-z0-9\-_]{95}$/;
  private readonly EXPECTED_PREFIX = "sk-ant-";
  private readonly EXPECTED_BODY_LENGTH = 95;
  private readonly ALLOWED_CHARS = /^[A-Za-z0-9\-_]+$/;

  /**
   * Validate API key pattern without making network requests
   * @param apiKey - The API key to validate
   * @returns PatternValidationResult with validation details
   */
  public validatePattern(apiKey: string): PatternValidationResult {
    const startTime = performance.now();

    try {
      // Input validation
      if (!apiKey || typeof apiKey !== "string") {
        return {
          valid: false,
          errorCode: "INVALID_PREFIX",
          message: "API key must be a non-empty string. Expected format: sk-ant-[95 characters]",
          validationTime: performance.now() - startTime,
        };
      }

      // Check prefix
      if (!apiKey.startsWith(this.EXPECTED_PREFIX)) {
        return {
          valid: false,
          errorCode: "INVALID_PREFIX",
          message: `API key must start with '${this.EXPECTED_PREFIX}'. Expected format: sk-ant-[95 characters of A-Za-z0-9\\-_]`,
          validationTime: performance.now() - startTime,
        };
      }

      // Extract body (everything after prefix)
      const keyBody = apiKey.slice(this.EXPECTED_PREFIX.length);

      // Check length
      if (keyBody.length !== this.EXPECTED_BODY_LENGTH) {
        return {
          valid: false,
          errorCode: "INVALID_LENGTH",
          message: `API key body must be exactly ${this.EXPECTED_BODY_LENGTH} characters long. Current length: ${keyBody.length}`,
          validationTime: performance.now() - startTime,
        };
      }

      // Check characters
      if (!this.ALLOWED_CHARS.test(keyBody)) {
        return {
          valid: false,
          errorCode: "INVALID_CHARACTERS",
          message: "API key contains invalid characters. Only allowed characters are: A-Za-z0-9\\-_",
          validationTime: performance.now() - startTime,
        };
      }

      // All checks passed
      return {
        valid: true,
        message: "API key format is valid",
        validationTime: performance.now() - startTime,
      };
    } catch (error) {
      // Handle any unexpected errors
      return {
        valid: false,
        errorCode: "INVALID_CHARACTERS",
        message: "Unexpected error during pattern validation",
        validationTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Validate API key by making actual API request
   * @param apiKey - The API key to validate
   * @param options - Validation options
   * @returns Promise resolving to validation result
   */
  public async validateAPI(
    apiKey: string,
    options?: ValidationOptions
  ): Promise<ValidationResult> {
    const startTime = Date.now();

    // First validate pattern
    const patternResult = this.validatePattern(apiKey);
    if (!patternResult.valid) {
      return {
        valid: false,
        statusCode: 400,
        message: patternResult.message,
        provider: this.name,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: {
          code: patternResult.errorCode || "PATTERN_VALIDATION_FAILED",
          message: patternResult.message,
          retryable: false,
        },
      };
    }

    // TODO: Implement actual API validation
    // This would make a request to Anthropic's API to validate the key
    return {
      valid: true,
      statusCode: 200,
      message: "Pattern validation passed (API validation not yet implemented)",
      provider: this.name,
      responseTime: Date.now() - startTime,
      timestamp: new Date(),
    };
  }

  /**
   * Get rate limit information for Anthropic API
   * @returns Rate limit configuration
   */
  public getRateLimit(): RateLimitConfig {
    return {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 5,
      recommendedDelay: 1000, // 1 second between requests
    };
  }

  /**
   * Get expected API key format information
   * @returns Key format information
   */
  public getKeyFormat(): KeyFormatInfo {
    return {
      prefix: this.EXPECTED_PREFIX,
      length: this.EXPECTED_PREFIX.length + this.EXPECTED_BODY_LENGTH,
      charset: "A-Za-z0-9\\-_",
      pattern: this.PATTERN_REGEX,
      example: "sk-ant-" + "x".repeat(this.EXPECTED_BODY_LENGTH),
      description: "Anthropic Claude API key with sk-ant- prefix followed by 95 alphanumeric characters, hyphens, or underscores",
    };
  }
}