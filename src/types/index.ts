/**
 * Type definitions for AI Key Validator
 *
 * Central type definitions used throughout the application.
 */

// Provider types
export type ProviderType = "openai" | "claude" | "gemini";

// Validation result interface
export interface ValidationResult {
  /** Whether the API key is valid */
  valid: boolean;
  /** HTTP status code from the validation request */
  statusCode: number;
  /** Human-readable status message */
  message: string;
  /** Provider that was validated */
  provider: ProviderType;
  /** Response time in milliseconds */
  responseTime: number;
  /** Additional metadata from the validation */
  metadata?: {
    /** Available models count (if applicable) */
    models?: number;
    /** Rate limit information (if available) */
    rateLimit?: string;
    /** Account tier or usage info (if available) */
    accountInfo?: string;
    /** API version or endpoint info */
    apiVersion?: string;
  };
  /** Timestamp when validation was performed */
  timestamp: Date;
  /** Error details if validation failed */
  error?: ValidationError;
}

// Validation error interface
export interface ValidationError {
  /** Error code from the provider or internal error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Original error details (without sensitive information) */
  details?: string;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Suggested action to resolve the error */
  suggestion?: string;
}

// Provider plugin interface
export interface IProviderPlugin {
  /** Provider name */
  readonly name: ProviderType;
  /** Provider display name */
  readonly displayName: string;
  /** Provider website URL */
  readonly website: string;

  /**
   * Validate API key pattern without making network requests
   * @param apiKey - The API key to validate
   * @returns True if pattern is valid, false otherwise
   */
  validatePattern(apiKey: string): boolean;

  /**
   * Validate API key by making actual API request
   * @param apiKey - The API key to validate
   * @param options - Validation options
   * @returns Promise resolving to validation result
   */
  validateAPI(apiKey: string, options?: ValidationOptions): Promise<ValidationResult>;

  /**
   * Get rate limit information for this provider
   * @returns Rate limit configuration
   */
  getRateLimit(): RateLimitConfig;

  /**
   * Get expected API key format information
   * @returns Key format information
   */
  getKeyFormat(): KeyFormatInfo;
}

// Validation options
export interface ValidationOptions {
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Whether to use cache for results */
  useCache?: boolean;
  /** Custom headers to send with request */
  headers?: Record<string, string>;
  /** Custom endpoint URL (for testing or custom deployments) */
  endpoint?: string;
  /** Whether to validate in strict mode */
  strict?: boolean;
}

// Rate limit configuration
export interface RateLimitConfig {
  /** Requests per minute limit */
  requestsPerMinute: number;
  /** Requests per hour limit */
  requestsPerHour: number;
  /** Requests per day limit */
  requestsPerDay: number;
  /** Burst limit for short periods */
  burstLimit: number;
  /** Recommended delay between requests in milliseconds */
  recommendedDelay: number;
}

// Key format information
export interface KeyFormatInfo {
  /** Expected prefix(es) for the key */
  prefix: string | string[];
  /** Expected total length or range */
  length: number | { min: number; max: number };
  /** Character set used in the key */
  charset: string;
  /** Regular expression pattern for validation */
  pattern: RegExp;
  /** Example of a valid key format (masked) */
  example: string;
  /** Human-readable description */
  description: string;
}

// Validator configuration
export interface ValidatorConfig {
  /** Default timeout for validation requests */
  defaultTimeout: number;
  /** Whether to enable caching */
  enableCache: boolean;
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  /** Maximum concurrent validations */
  maxConcurrency: number;
  /** Whether to enable rate limiting */
  enableRateLimit: boolean;
  /** Custom provider configurations */
  providers: Record<ProviderType, ProviderConfig>;
  /** Security settings */
  security: SecurityConfig;
  /** Logging configuration */
  logging: LoggingConfig;
}

// Provider-specific configuration
export interface ProviderConfig {
  /** Whether this provider is enabled */
  enabled: boolean;
  /** Custom endpoint URL */
  endpoint?: string;
  /** Custom timeout for this provider */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Rate limit overrides */
  rateLimit?: Partial<RateLimitConfig>;
}

// Security configuration
export interface SecurityConfig {
  /** Whether to enable memory scrubbing */
  enableMemoryScrubbing: boolean;
  /** Whether to enable audit logging */
  enableAuditLogging: boolean;
  /** Maximum memory usage in MB */
  maxMemoryUsage: number;
  /** Whether to redact sensitive data in logs */
  redactSensitiveData: boolean;
  /** Allowed characters in API keys (security validation) */
  allowedKeyCharacters: string;
}

// Logging configuration
export interface LoggingConfig {
  /** Log level */
  level: "error" | "warn" | "info" | "debug";
  /** Whether to enable console logging */
  console: boolean;
  /** File logging configuration */
  file?: {
    enabled: boolean;
    path: string;
    maxSize: string;
    maxFiles: number;
  };
  /** Whether to enable structured logging */
  structured: boolean;
}

// Security context for operations
export interface SecurityContext {
  /** Unique operation ID for tracking */
  operationId: string;
  /** Timestamp when context was created */
  timestamp: Date;
  /** Whether this is a sensitive operation */
  sensitive: boolean;
  /** Memory cleanup callback */
  cleanup: () => void;
}

// Cache entry interface
export interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** Timestamp when cached */
  timestamp: Date;
  /** TTL in milliseconds */
  ttl: number;
  /** Cache key hash (for verification) */
  keyHash: string;
}

// Batch validation request
export interface BatchValidationRequest {
  /** Array of validation requests */
  requests: Array<{
    provider: ProviderType;
    apiKey: string;
    id?: string;
  }>;
  /** Options for the batch */
  options?: {
    concurrency?: number;
    stopOnError?: boolean;
    timeout?: number;
  };
}

// Batch validation result
export interface BatchValidationResult {
  /** Array of individual results */
  results: Array<ValidationResult & { id?: string }>;
  /** Summary statistics */
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errors: number;
    duration: number;
  };
  /** Any batch-level errors */
  errors?: ValidationError[];
}

// Plugin registration info
export interface PluginInfo {
  /** Plugin name/identifier */
  name: string;
  /** Plugin version */
  version: string;
  /** Plugin description */
  description: string;
  /** Plugin author */
  author: string;
  /** Whether plugin is enabled */
  enabled: boolean;
  /** Plugin instance */
  instance: IProviderPlugin;
}
