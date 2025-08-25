/**
 * Error classes for AI Key Validator
 *
 * Defines custom error classes for different types of validation failures.
 */

/**
 * Base error class for AI Key Validator
 */
export class AIKeyValidatorError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly timestamp: Date;

  constructor(message: string, code: string = "UNKNOWN_ERROR", retryable: boolean = false) {
    super(message);
    this.name = "AIKeyValidatorError";
    this.code = code;
    this.retryable = retryable;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIKeyValidatorError);
    }
  }
}

/**
 * Error thrown when API key validation fails
 */
export class ValidationError extends AIKeyValidatorError {
  public readonly statusCode: number;
  public readonly provider: string;

  constructor(
    message: string,
    provider: string,
    statusCode: number = 400,
    code: string = "VALIDATION_FAILED",
    retryable: boolean = false
  ) {
    super(message, code, retryable);
    this.name = "ValidationError";
    this.statusCode = statusCode;
    this.provider = provider;
  }
}

/**
 * Error thrown when network requests fail
 */
export class NetworkError extends AIKeyValidatorError {
  public readonly statusCode: number | undefined;
  public readonly provider: string;

  constructor(
    message: string,
    provider: string,
    statusCode?: number,
    code: string = "NETWORK_ERROR",
    retryable: boolean = true
  ) {
    super(message, code, retryable);
    this.name = "NetworkError";
    this.statusCode = statusCode;
    this.provider = provider;
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends AIKeyValidatorError {
  constructor(message: string, code: string = "CONFIGURATION_ERROR") {
    super(message, code, false);
    this.name = "ConfigurationError";
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends AIKeyValidatorError {
  public readonly retryAfter: number | undefined;
  public readonly provider: string;

  constructor(
    message: string,
    provider: string,
    retryAfter?: number,
    code: string = "RATE_LIMIT_EXCEEDED"
  ) {
    super(message, code, true);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
    this.provider = provider;
  }
}

/**
 * Error thrown when security constraints are violated
 */
export class SecurityError extends AIKeyValidatorError {
  constructor(message: string, code: string = "SECURITY_ERROR") {
    super(message, code, false);
    this.name = "SecurityError";
  }
}

/**
 * Error thrown when plugin operations fail
 */
export class PluginError extends AIKeyValidatorError {
  public readonly pluginName: string;

  constructor(message: string, pluginName: string, code: string = "PLUGIN_ERROR") {
    super(message, code, false);
    this.name = "PluginError";
    this.pluginName = pluginName;
  }
}

/**
 * Error thrown when timeout occurs
 */
export class TimeoutError extends AIKeyValidatorError {
  public readonly timeout: number;
  public readonly provider: string;

  constructor(message: string, provider: string, timeout: number, code: string = "TIMEOUT_ERROR") {
    super(message, code, true);
    this.name = "TimeoutError";
    this.timeout = timeout;
    this.provider = provider;
  }
}
