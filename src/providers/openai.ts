/**
 * OpenAI API Key Validator Provider
 * 
 * Implements live validation for OpenAI API keys using the /v1/models endpoint.
 * Handles all OpenAI-specific error scenarios and response formats.
 */

import axios, { AxiosError } from "axios";
import {
  IProviderPlugin,
  ValidationResult,
  ValidationOptions,
  RateLimitConfig,
  KeyFormatInfo,
  ValidationError,
  ProviderType
} from "../types";

export class OpenAIProvider implements IProviderPlugin {
  public readonly name: ProviderType = "openai";
  public readonly displayName = "OpenAI";
  public readonly website = "https://openai.com";
  
  // OpenAI API configuration
  private readonly baseUrl = "https://api.openai.com";
  private readonly modelsEndpoint = "/v1/models";
  
  /**
   * Validate OpenAI API key pattern without making network requests
   * @param apiKey - The API key to validate
   * @returns True if pattern is valid, false otherwise
   */
  public validatePattern(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== "string") {
      return false;
    }
    
    // OpenAI keys follow these patterns:
    // - Legacy: sk-... (48-51 characters total)
    // - Project keys: sk-proj-... (starts with sk-proj-, longer)
    // - Session keys: sk-... (various lengths)
    
    const patterns = [
      /^sk-[A-Za-z0-9]{48}$/, // Legacy format
      /^sk-proj-[A-Za-z0-9_-]{64}$/, // Project key format
      /^sk-[A-Za-z0-9_-]{20,}$/ // General format for other types
    ];
    
    return patterns.some(pattern => pattern.test(apiKey));
  }

  /**
   * Validate OpenAI API key by making actual API request to /v1/models
   * @param apiKey - The API key to validate
   * @param options - Validation options
   * @returns Promise resolving to validation result
   */
  public async validateAPI(apiKey: string, options?: ValidationOptions): Promise<ValidationResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    
    try {
      // Input validation
      if (!apiKey || typeof apiKey !== "string") {
        return this.createErrorResult("INVALID_INPUT", "API key is required and must be a string", false, startTime, timestamp);
      }
      
      if (!this.validatePattern(apiKey)) {
        return this.createErrorResult("INVALID_KEY_FORMAT", "API key format is invalid for OpenAI", false, startTime, timestamp);
      }
      
      // Make API request to validate the key
      const response = await axios.get(`${this.baseUrl}${this.modelsEndpoint}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(options?.headers || {})
        },
        timeout: options?.timeout || 30000
      });
      
      const responseTime = Date.now() - startTime;
      
      // Parse successful response
      const models = response.data?.data || [];
      const modelsCount = Array.isArray(models) ? models.length : 0;
      
      return {
        valid: true,
        statusCode: response.status,
        message: `API key is valid. Found ${modelsCount} available models.`,
        provider: this.name,
        responseTime,
        timestamp,
        metadata: {
          models: modelsCount,
          apiVersion: response.headers["openai-version"] || "unknown"
        }
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return this.handleError(error, responseTime, timestamp);
    }
  }
  
  /**
   * Handle various error scenarios from OpenAI API
   */
  private handleError(error: any, responseTime: number, timestamp: Date): ValidationResult {
    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data?.error;
      
      switch (status) {
        case 401:
          return this.createValidationResult(
            false,
            401,
            "API key is invalid or has been revoked",
            responseTime,
            timestamp,
            {
              code: errorData?.code || "invalid_api_key",
              message: errorData?.message || "Invalid API key",
              retryable: false,
              suggestion: "Check your API key and ensure it's correctly formatted"
            }
          );
          
        case 429:
          return this.createValidationResult(
            false,
            429,
            "Rate limit exceeded. Please wait before making more requests.",
            responseTime,
            timestamp,
            {
              code: errorData?.code || "rate_limit_exceeded",
              message: errorData?.message || "Rate limit exceeded",
              retryable: true,
              suggestion: "Wait for the rate limit to reset and try again"
            },
            {
              rateLimit: this.extractRateLimitInfo(error.response.headers)
            }
          );
          
        case 500:
        case 502:
        case 503:
        case 504:
          return this.createValidationResult(
            false,
            status,
            "OpenAI API server error. Please try again later.",
            responseTime,
            timestamp,
            {
              code: errorData?.code || "internal_server_error",
              message: errorData?.message || "Server error",
              retryable: true,
              suggestion: "The issue is on OpenAI's side. Please try again in a few minutes"
            }
          );
          
        default:
          return this.createValidationResult(
            false,
            status,
            `Unexpected API response: ${status}`,
            responseTime,
            timestamp,
            {
              code: errorData?.code || "api_error",
              message: errorData?.message || "Unexpected API error",
              retryable: status >= 500,
              suggestion: "Check the API documentation or contact support"
            }
          );
      }
    }
    
    // Handle network/timeout errors
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return this.createValidationResult(
        false,
        408,
        "Request timeout. The API took too long to respond.",
        responseTime,
        timestamp,
        {
          code: "TIMEOUT_ERROR",
          message: "Request timeout",
          retryable: true,
          suggestion: "Check your internet connection and try again"
        }
      );
    }
    
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.code === "ECONNRESET") {
      return this.createValidationResult(
        false,
        503,
        "Network connection error. Please check your internet connection.",
        responseTime,
        timestamp,
        {
          code: "NETWORK_ERROR",
          message: "Network connection failed",
          retryable: true,
          suggestion: "Check your internet connection and firewall settings"
        }
      );
    }
    
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return this.createValidationResult(
      false,
      500,
      `Validation failed: ${errorMessage}`,
      responseTime,
      timestamp,
      {
        code: "UNKNOWN_ERROR",
        message: errorMessage,
        retryable: false,
        suggestion: "Please report this issue if it persists"
      }
    );
  }
  
  /**
   * Extract rate limit information from response headers
   */
  private extractRateLimitInfo(headers: any): string {
    const remaining = headers["x-ratelimit-remaining-requests"];
    const reset = headers["x-ratelimit-reset-requests"];
    
    if (remaining !== undefined || reset !== undefined) {
      return `Remaining: ${remaining || "unknown"}, Reset: ${reset || "unknown"}`;
    }
    
    return "Rate limit information not available";
  }
  
  /**
   * Create error result for common error scenarios
   */
  private createErrorResult(
    code: string,
    message: string,
    retryable: boolean,
    startTime: number,
    timestamp: Date,
    statusCode: number = 400
  ): ValidationResult {
    return this.createValidationResult(
      false,
      statusCode,
      message,
      Date.now() - startTime,
      timestamp,
      {
        code,
        message,
        retryable,
        suggestion: "Check your input and try again"
      }
    );
  }
  
  /**
   * Create a standardized validation result
   */
  private createValidationResult(
    valid: boolean,
    statusCode: number,
    message: string,
    responseTime: number,
    timestamp: Date,
    error?: ValidationError,
    metadata?: any
  ): ValidationResult {
    return {
      valid,
      statusCode,
      message,
      provider: this.name,
      responseTime,
      timestamp,
      ...(error && { error }),
      ...(metadata && { metadata })
    };
  }

  /**
   * Get rate limit configuration for OpenAI
   * @returns Rate limit configuration
   */
  public getRateLimit(): RateLimitConfig {
    return {
      requestsPerMinute: 60,    // Conservative estimate
      requestsPerHour: 3000,    // Varies by plan
      requestsPerDay: 10000,    // Varies by plan
      burstLimit: 10,           // Conservative burst limit
      recommendedDelay: 1000    // 1 second delay recommended
    };
  }

  /**
   * Get expected API key format information
   * @returns Key format information
   */
  public getKeyFormat(): KeyFormatInfo {
    return {
      prefix: ["sk-", "sk-proj-"],
      length: { min: 20, max: 100 },
      charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-",
      pattern: /^sk-(?:proj-)?[A-Za-z0-9_-]+$/,
      example: "sk-proj-abc123...xyz789",
      description: "OpenAI API keys start with 'sk-' or 'sk-proj-' followed by alphanumeric characters, underscores, and hyphens"
    };
  }
}