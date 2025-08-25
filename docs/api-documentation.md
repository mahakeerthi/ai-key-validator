# AI Key Validator - API Documentation

**Version:** 1.0  
**Date:** August 25, 2025  
**Document Owner:** Engineering Team

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Interfaces & Types](#core-interfaces--types)
5. [Main Validator API](#main-validator-api)
6. [Provider Plugin API](#provider-plugin-api)
7. [CLI Command API](#cli-command-api)
8. [Security API](#security-api)
9. [Configuration API](#configuration-api)
10. [Error Handling API](#error-handling-api)
11. [Provider Specifications](#provider-specifications)
12. [Code Examples](#code-examples)
13. [TypeScript Type Definitions](#typescript-type-definitions)

## Overview

The AI Key Validator is a TypeScript-first npm package that provides secure, fast validation of API keys for major AI providers. It offers both programmatic APIs and CLI interfaces with a plugin-based architecture for extensibility.

### Key Features

- **Security-First**: Memory-only operations, secure key handling, zero persistence
- **Multi-Provider Support**: OpenAI, Anthropic/Claude, Google Gemini with plugin architecture
- **Performance Optimized**: <2s validation, intelligent caching, rate limiting
- **Developer Experience**: TypeScript-first with comprehensive IntelliSense support
- **CLI & Programmatic**: Interactive CLI and headless automation modes

### Architecture

```typescript
┌─────────────────────────────────────────────────────────────┐
│                    CLI Interface Layer                      │
├─────────────────────┬───────────────────┬───────────────────┤
│  Interactive Mode   │   Headless Mode   │   Library Mode    │
└─────────────────────┼───────────────────┼───────────────────┘
                      │                   │
┌─────────────────────┴───────────────────┴───────────────────┐
│                  Core Validation Engine                     │
├─────────────────────┬───────────────────┬───────────────────┤
│  Pattern Validator  │   Live Validator  │  Result Manager   │
└─────────────────────┼───────────────────┼───────────────────┘
                      │                   │
┌─────────────────────┴───────────────────┴───────────────────┐
│                    Plugin System                            │
├─────────────────────┬───────────────────┬───────────────────┤
│   OpenAI Plugin     │  Anthropic Plugin │  Gemini Plugin    │
└─────────────────────┴───────────────────┴───────────────────┘
```

## Installation

### NPM Installation

```bash
# Global installation for CLI usage
npm install -g ai-key-validator

# Local project installation for programmatic usage
npm install ai-key-validator

# Development dependencies
npm install --save-dev @types/ai-key-validator
```

### Usage with npx

```bash
# Direct execution without installation
npx ai-key-validator

# With specific flags
npx ai-key-validator -p openai --api-key sk-...
```

### Requirements

- **Node.js**: 18.0.0 or higher
- **TypeScript**: 5.0+ (for development)
- **Operating Systems**: Windows, macOS, Linux

## Quick Start

### Interactive CLI Mode

```bash
# Launch interactive mode
ai-key-validator

# Select provider and enter key when prompted
? Select AI Provider: OpenAI
? Enter API Key: [masked input]
✅ VALID - OpenAI API Key validated in 1.2s
```

### Headless CLI Mode

```bash
# Direct validation with flags
ai-key-validator -p openai --api-key sk-1234567890abcdef...

# Using environment variables
export OPENAI_API_KEY=sk-1234567890abcdef...
ai-key-validator -p openai

# JSON output for automation
ai-key-validator -p openai --api-key sk-... --json
```

### Programmatic Usage

```typescript
import { AIKeyValidator, ProviderType } from 'ai-key-validator';

const validator = new AIKeyValidator();

// Basic validation
const result = await validator.validate('sk-1234...', 'openai');
console.log(result.valid); // true/false

// Batch validation
const results = await validator.validateBatch([
  { key: 'sk-openai...', provider: 'openai' },
  { key: 'sk-ant-claude...', provider: 'anthropic' }
]);
```

## Core Interfaces & Types

### IProviderPlugin Interface

The foundation interface that all provider plugins must implement.

```typescript
/**
 * Core interface for provider plugins that handle AI API key validation
 * @interface IProviderPlugin
 */
interface IProviderPlugin {
  /** Human-readable provider name (e.g., "OpenAI", "Anthropic") */
  readonly name: string;
  
  /** Provider type identifier used for routing */
  readonly type: ProviderType;
  
  /** Plugin version following semantic versioning */
  readonly version: string;
  
  /** Supported API version for the provider */
  readonly apiVersion: string;
  
  /**
   * Validates API key format without making network requests
   * @param key - The API key to validate
   * @returns Pattern validation result with errors if invalid
   */
  validatePattern(key: string): PatternValidationResult;
  
  /**
   * Tests API key against live provider API
   * @param key - The API key to validate
   * @param options - Optional validation parameters
   * @returns Promise resolving to live validation result
   */
  validateLive(key: string, options?: LiveValidationOptions): Promise<LiveValidationResult>;
  
  /**
   * Generates minimal test request for live validation
   * @param key - The API key for authentication
   * @returns API request configuration object
   */
  getTestRequest(key: string): ApiRequest;
  
  /**
   * Parses provider-specific API responses
   * @param response - Raw API response from provider
   * @returns Standardized validation result
   */
  parseResponse(response: ApiResponse): ValidationResult;
  
  /**
   * Returns rate limiting configuration for the provider
   * @returns Rate limit configuration object
   */
  getRateLimits(): RateLimitConfig;
}
```

### ValidationResult Type

Standardized result type returned by all validation operations.

```typescript
/**
 * Comprehensive validation result with detailed metadata
 * @interface ValidationResult
 */
interface ValidationResult {
  /** Whether the API key is valid and active */
  valid: boolean;
  
  /** Provider that was validated against */
  provider: ProviderType;
  
  /** HTTP status code from live validation (if applicable) */
  status?: number;
  
  /** Array of validation errors */
  errors: ValidationError[];
  
  /** Additional metadata about the validation */
  metadata: ValidationMetadata;
  
  /** Performance timing information */
  timing?: {
    /** Total validation time in milliseconds */
    total: number;
    /** Pattern validation time */
    pattern?: number;
    /** Network request time */
    network?: number;
    /** Response parsing time */
    parsing?: number;
  };
  
  /** Indicates if validation was served from cache */
  cached?: boolean;
  
  /** Timestamp when validation was performed */
  timestamp: Date;
}

/**
 * Detailed error information with actionable guidance
 */
interface ValidationError {
  /** Error category for programmatic handling */
  code: ValidationErrorCode;
  
  /** Human-readable error message */
  message: string;
  
  /** Actionable suggestions for resolution */
  suggestions?: string[];
  
  /** Additional error context */
  details?: Record<string, unknown>;
}

/**
 * Additional metadata about the validation process
 */
interface ValidationMetadata {
  /** Validation strategy used (pattern, live, cached) */
  strategy: 'pattern' | 'live' | 'cached';
  
  /** API endpoint used for live validation */
  endpoint?: string;
  
  /** Rate limiting information */
  rateLimiting?: {
    /** Remaining requests in current window */
    remaining: number;
    /** Rate limit reset time */
    resetTime: Date;
    /** Current rate limit window */
    windowSize: number;
  };
  
  /** Provider-specific metadata */
  providerData?: Record<string, unknown>;
}
```

### ValidatorConfig Interface

Configuration interface for customizing validator behavior.

```typescript
/**
 * Comprehensive configuration for validator behavior
 * @interface ValidatorConfig
 */
interface ValidatorConfig {
  /** Provider-specific configurations */
  providers: ProviderConfig[];
  
  /** Security-related settings */
  security: SecurityConfig;
  
  /** Performance and caching settings */
  performance: PerformanceConfig;
  
  /** CLI-specific configurations */
  cli?: CLIConfig;
  
  /** Logging configuration */
  logging?: LoggingConfig;
}

interface ProviderConfig {
  /** Provider type identifier */
  type: ProviderType;
  
  /** Whether provider is enabled */
  enabled: boolean;
  
  /** Rate limiting configuration */
  rateLimits: RateLimitConfig;
  
  /** Request timeout in milliseconds */
  timeout: number;
  
  /** Number of retry attempts for failed requests */
  retries: number;
  
  /** Custom API endpoints (if different from defaults) */
  endpoints?: {
    validation?: string;
    [key: string]: string;
  };
}

interface SecurityConfig {
  /** Enable audit logging */
  auditLogging: boolean;
  
  /** Secure memory pool size in MB */
  memoryPoolSize: number;
  
  /** Input timeout in milliseconds */
  inputTimeout: number;
  
  /** Maximum allowed key length */
  maxKeyLength: number;
  
  /** Enable memory cleanup verification */
  verifyCleanup: boolean;
}

interface PerformanceConfig {
  /** Result cache size (number of entries) */
  cacheSize: number;
  
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  
  /** Maximum concurrent validation requests */
  maxConcurrentRequests: number;
  
  /** Default request timeout in milliseconds */
  requestTimeout: number;
  
  /** Enable performance monitoring */
  monitoring: boolean;
}
```

### SecurityContext Interface

Security context for managing secure operations.

```typescript
/**
 * Security context for managing sensitive operations
 * @interface SecurityContext
 */
interface SecurityContext {
  /** Unique session identifier */
  sessionId: string;
  
  /** Security level (standard, high, enterprise) */
  securityLevel: 'standard' | 'high' | 'enterprise';
  
  /** Audit logging configuration */
  auditConfig: AuditConfig;
  
  /** Memory management settings */
  memoryConfig: MemoryConfig;
}

interface AuditConfig {
  /** Enable audit logging */
  enabled: boolean;
  
  /** Log level for audit events */
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  
  /** Include timing information */
  includeTiming: boolean;
  
  /** Log destination */
  destination: 'console' | 'file' | 'siem';
}

interface MemoryConfig {
  /** Enable secure memory allocation */
  secureAllocation: boolean;
  
  /** Automatic cleanup interval in milliseconds */
  cleanupInterval: number;
  
  /** Verify cleanup completion */
  verifyCleanup: boolean;
}
```

## Main Validator API

### AIKeyValidator Class

The primary class for programmatic API key validation.

```typescript
/**
 * Main validator class providing comprehensive API key validation
 * @class AIKeyValidator
 */
export class AIKeyValidator {
  private pluginManager: IPluginManager;
  private securityManager: ISecurityManager;
  private resultCache: ResultCache<ValidationResult>;
  private performanceMonitor: PerformanceMonitor;
  
  /**
   * Creates a new AIKeyValidator instance
   * @param config - Optional configuration object
   * @param securityContext - Optional security context
   * 
   * @example
   * ```typescript
   * const validator = new AIKeyValidator({
   *   performance: {
   *     cacheSize: 1000,
   *     cacheTTL: 300000, // 5 minutes
   *     requestTimeout: 30000
   *   },
   *   security: {
   *     auditLogging: true,
   *     memoryPoolSize: 10
   *   }
   * });
   * ```
   */
  constructor(config?: ValidatorConfig, securityContext?: SecurityContext);
  
  /**
   * Validates a single API key
   * @param key - The API key to validate
   * @param provider - The AI provider type
   * @param options - Optional validation options
   * @returns Promise resolving to validation result
   * 
   * @example
   * ```typescript
   * const result = await validator.validate(
   *   'sk-1234567890abcdef...',
   *   'openai',
   *   { 
   *     strategy: 'live',
   *     timeout: 10000 
   *   }
   * );
   * 
   * if (result.valid) {
   *   console.log('✅ Key is valid');
   *   console.log(`Validated in ${result.timing.total}ms`);
   * } else {
   *   console.log('❌ Key is invalid');
   *   result.errors.forEach(error => {
   *     console.log(`Error: ${error.message}`);
   *     error.suggestions?.forEach(suggestion => {
   *       console.log(`  💡 ${suggestion}`);
   *     });
   *   });
   * }
   * ```
   */
  async validate(
    key: string, 
    provider: ProviderType,
    options?: ValidationOptions
  ): Promise<ValidationResult>;
  
  /**
   * Validates multiple API keys in batch
   * @param requests - Array of validation requests
   * @param options - Optional batch validation options
   * @returns Promise resolving to array of validation results
   * 
   * @example
   * ```typescript
   * const results = await validator.validateBatch([
   *   { key: 'sk-openai...', provider: 'openai' },
   *   { key: 'sk-ant-claude...', provider: 'anthropic' },
   *   { key: 'google-gemini...', provider: 'gemini' }
   * ], {
   *   concurrency: 3,
   *   continueOnError: true
   * });
   * 
   * const summary = results.reduce((acc, result) => {
   *   acc[result.valid ? 'valid' : 'invalid']++;
   *   return acc;
   * }, { valid: 0, invalid: 0 });
   * 
   * console.log(`✅ Valid: ${summary.valid}, ❌ Invalid: ${summary.invalid}`);
   * ```
   */
  async validateBatch(
    requests: ValidationRequest[],
    options?: BatchValidationOptions
  ): Promise<ValidationResult[]>;
  
  /**
   * Validates API key pattern without network requests
   * @param key - The API key to validate
   * @param provider - The AI provider type
   * @returns Pattern validation result
   * 
   * @example
   * ```typescript
   * const patternResult = validator.validatePattern('sk-invalid', 'openai');
   * if (!patternResult.valid) {
   *   console.log('Invalid OpenAI key format');
   *   patternResult.errors.forEach(error => {
   *     console.log(`  ${error.code}: ${error.message}`);
   *   });
   * }
   * ```
   */
  validatePattern(key: string, provider: ProviderType): PatternValidationResult;
  
  /**
   * Gets available provider information
   * @returns Array of provider information objects
   * 
   * @example
   * ```typescript
   * const providers = validator.getProviders();
   * providers.forEach(provider => {
   *   console.log(`${provider.name} (${provider.type}) v${provider.version}`);
   * });
   * ```
   */
  getProviders(): ProviderInfo[];
  
  /**
   * Registers a custom provider plugin
   * @param plugin - The provider plugin to register
   * 
   * @example
   * ```typescript
   * import { CustomProviderPlugin } from './custom-provider';
   * 
   * const customPlugin = new CustomProviderPlugin();
   * validator.registerProvider(customPlugin);
   * 
   * // Now validate using custom provider
   * const result = await validator.validate(apiKey, 'custom');
   * ```
   */
  registerProvider(plugin: IProviderPlugin): void;
  
  /**
   * Gets performance metrics and statistics
   * @returns Performance metrics object
   * 
   * @example
   * ```typescript
   * const metrics = validator.getPerformanceMetrics();
   * console.log(`Average validation time: ${metrics.averageResponseTime}ms`);
   * console.log(`Cache hit rate: ${metrics.cacheHitRate * 100}%`);
   * console.log(`Success rate: ${metrics.successRate * 100}%`);
   * ```
   */
  getPerformanceMetrics(): PerformanceMetrics;
  
  /**
   * Clears result cache and performs cleanup
   * @example
   * ```typescript
   * // Clear cache before batch operations
   * validator.clearCache();
   * 
   * // Perform cleanup on application shutdown
   * process.on('SIGINT', () => {
   *   validator.clearCache();
   *   process.exit(0);
   * });
   * ```
   */
  clearCache(): void;
  
  /**
   * Performs health check on validator and providers
   * @returns Promise resolving to health check results
   * 
   * @example
   * ```typescript
   * const health = await validator.healthCheck();
   * console.log(`Overall health: ${health.status}`);
   * 
   * health.checks.forEach(check => {
   *   console.log(`${check.name}: ${check.status}`);
   *   if (check.message) {
   *     console.log(`  ${check.message}`);
   *   }
   * });
   * ```
   */
  async healthCheck(): Promise<HealthCheckResult>;
}
```

### Supporting Types for Main API

```typescript
/**
 * Options for individual validation requests
 */
interface ValidationOptions {
  /** Validation strategy to use */
  strategy?: 'pattern' | 'live' | 'auto';
  
  /** Request timeout in milliseconds */
  timeout?: number;
  
  /** Whether to bypass cache */
  bypassCache?: boolean;
  
  /** Custom request headers */
  headers?: Record<string, string>;
  
  /** Enable detailed timing */
  enableTiming?: boolean;
}

/**
 * Individual validation request for batch operations
 */
interface ValidationRequest {
  /** API key to validate */
  key: string;
  
  /** Provider to validate against */
  provider: ProviderType;
  
  /** Optional validation options */
  options?: ValidationOptions;
  
  /** Optional request identifier */
  id?: string;
}

/**
 * Options for batch validation operations
 */
interface BatchValidationOptions {
  /** Maximum concurrent validations */
  concurrency?: number;
  
  /** Continue processing if individual validations fail */
  continueOnError?: boolean;
  
  /** Progress callback for batch operations */
  onProgress?: (completed: number, total: number) => void;
  
  /** Global timeout for entire batch operation */
  batchTimeout?: number;
}

/**
 * Performance metrics and statistics
 */
interface PerformanceMetrics {
  /** Total number of validations performed */
  totalValidations: number;
  
  /** Average validation response time in milliseconds */
  averageResponseTime: number;
  
  /** Success rate (0-1) */
  successRate: number;
  
  /** Cache hit rate (0-1) */
  cacheHitRate: number;
  
  /** Error rate (0-1) */
  errorRate: number;
  
  /** Current memory usage in bytes */
  memoryUsage: number;
  
  /** Validation counts by provider */
  providerStats: Record<ProviderType, {
    total: number;
    successful: number;
    averageTime: number;
  }>;
}

/**
 * Health check result
 */
interface HealthCheckResult {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** Individual check results */
  checks: HealthCheck[];
  
  /** Timestamp of health check */
  timestamp: Date;
  
  /** Overall response time */
  responseTime: number;
}

interface HealthCheck {
  /** Name of the health check */
  name: string;
  
  /** Status of this specific check */
  status: 'healthy' | 'degraded' | 'unhealthy';
  
  /** Optional message */
  message?: string;
  
  /** Response time for this check */
  responseTime?: number;
}
```

## Provider Plugin API

### Plugin Development Interface

```typescript
/**
 * Base class for provider plugin development
 * @abstract BaseProviderPlugin
 */
export abstract class BaseProviderPlugin implements IProviderPlugin {
  abstract readonly name: string;
  abstract readonly type: ProviderType;
  abstract readonly version: string;
  abstract readonly apiVersion: string;
  
  /**
   * Abstract methods that must be implemented by provider plugins
   */
  abstract validatePattern(key: string): PatternValidationResult;
  abstract validateLive(key: string, options?: LiveValidationOptions): Promise<LiveValidationResult>;
  abstract getTestRequest(key: string): ApiRequest;
  abstract parseResponse(response: ApiResponse): ValidationResult;
  abstract getRateLimits(): RateLimitConfig;
  
  /**
   * Utility method for making HTTP requests
   * @protected
   */
  protected async makeRequest(request: ApiRequest, options?: RequestOptions): Promise<ApiResponse> {
    // Implementation provided by base class
  }
  
  /**
   * Utility method for error handling
   * @protected
   */
  protected handleError(error: Error, context: string): ValidationError {
    // Implementation provided by base class
  }
  
  /**
   * Utility method for creating validation results
   * @protected
   */
  protected createResult(
    valid: boolean,
    provider: ProviderType,
    errors: ValidationError[] = [],
    metadata: Partial<ValidationMetadata> = {}
  ): ValidationResult {
    // Implementation provided by base class
  }
}
```

### Plugin Registration System

```typescript
/**
 * Plugin registry for managing provider plugins
 * @class PluginRegistry
 */
export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<ProviderType, IProviderPlugin>;
  
  /**
   * Get singleton registry instance
   */
  static getInstance(): PluginRegistry;
  
  /**
   * Register a new provider plugin
   * @param plugin - The plugin to register
   * @throws {PluginValidationError} If plugin is invalid
   * 
   * @example
   * ```typescript
   * import { PluginRegistry } from 'ai-key-validator';
   * 
   * class CustomProvider extends BaseProviderPlugin {
   *   readonly name = 'Custom AI';
   *   readonly type = 'custom' as ProviderType;
   *   readonly version = '1.0.0';
   *   readonly apiVersion = 'v1';
   * 
   *   validatePattern(key: string): PatternValidationResult {
   *     const pattern = /^custom-[a-zA-Z0-9]{32}$/;
   *     const valid = pattern.test(key);
   *     return {
   *       valid,
   *       format: 'custom-format',
   *       errors: valid ? [] : [{
   *         code: 'INVALID_FORMAT',
   *         message: 'Custom key must start with "custom-" and be 39 characters total'
   *       }]
   *     };
   *   }
   * 
   *   // ... implement other required methods
   * }
   * 
   * const registry = PluginRegistry.getInstance();
   * registry.registerPlugin(new CustomProvider());
   * ```
   */
  registerPlugin(plugin: IProviderPlugin): void;
  
  /**
   * Get registered plugin by provider type
   * @param type - Provider type
   * @returns The registered plugin
   * @throws {ProviderNotFoundError} If provider not found
   */
  getPlugin(type: ProviderType): IProviderPlugin;
  
  /**
   * List all registered plugins
   * @returns Array of provider information
   */
  listPlugins(): ProviderInfo[];
  
  /**
   * Check if provider is registered
   * @param type - Provider type to check
   * @returns True if provider is registered
   */
  hasProvider(type: ProviderType): boolean;
  
  /**
   * Unregister a provider plugin
   * @param type - Provider type to unregister
   */
  unregisterPlugin(type: ProviderType): void;
  
  /**
   * Validate plugin before registration
   * @param plugin - Plugin to validate
   * @returns Validation result with errors if invalid
   */
  validatePlugin(plugin: IProviderPlugin): PluginValidationResult;
}

interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### Example Plugin Implementation

```typescript
/**
 * Example implementation of a custom provider plugin
 */
export class ExampleProvider extends BaseProviderPlugin {
  readonly name = 'Example AI Provider';
  readonly type = 'example' as ProviderType;
  readonly version = '1.0.0';
  readonly apiVersion = 'v1';
  
  validatePattern(key: string): PatternValidationResult {
    // Example: keys must start with 'ex-' and be 32 characters total
    const pattern = /^ex-[a-zA-Z0-9]{29}$/;
    const valid = pattern.test(key);
    
    return {
      valid,
      format: 'example-format',
      errors: valid ? [] : [{
        code: 'INVALID_FORMAT',
        message: 'Example keys must start with "ex-" followed by 29 alphanumeric characters',
        suggestions: [
          'Check that your key starts with "ex-"',
          'Ensure the key is exactly 32 characters long',
          'Verify the key contains only letters and numbers after "ex-"'
        ]
      }]
    };
  }
  
  async validateLive(key: string, options?: LiveValidationOptions): Promise<LiveValidationResult> {
    try {
      const request = this.getTestRequest(key);
      const response = await this.makeRequest(request, {
        timeout: options?.timeout || 30000
      });
      
      return this.parseResponse(response);
    } catch (error) {
      return {
        valid: false,
        status: 0,
        response: null,
        metadata: {
          strategy: 'live',
          error: this.handleError(error as Error, 'live-validation')
        }
      };
    }
  }
  
  getTestRequest(key: string): ApiRequest {
    return {
      url: 'https://api.example.com/v1/validate',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ai-key-validator/1.0.0'
      },
      body: {
        action: 'validate'
      }
    };
  }
  
  parseResponse(response: ApiResponse): ValidationResult {
    const valid = response.status === 200;
    const errors: ValidationError[] = [];
    
    if (!valid) {
      errors.push({
        code: this.mapStatusToErrorCode(response.status),
        message: this.getErrorMessage(response.status),
        suggestions: this.getErrorSuggestions(response.status)
      });
    }
    
    return this.createResult(valid, this.type, errors, {
      strategy: 'live',
      endpoint: response.url,
      providerData: {
        responseHeaders: response.headers,
        statusText: response.statusText
      }
    });
  }
  
  getRateLimits(): RateLimitConfig {
    return {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      burstLimit: 10,
      backoffStrategy: 'exponential'
    };
  }
  
  private mapStatusToErrorCode(status: number): ValidationErrorCode {
    switch (status) {
      case 401: return 'INVALID_KEY';
      case 403: return 'ACCESS_DENIED';
      case 429: return 'RATE_LIMITED';
      case 500: return 'SERVER_ERROR';
      default: return 'UNKNOWN_ERROR';
    }
  }
  
  private getErrorMessage(status: number): string {
    switch (status) {
      case 401: return 'API key is invalid or expired';
      case 403: return 'API key does not have required permissions';
      case 429: return 'Rate limit exceeded, please wait before retrying';
      case 500: return 'Server error occurred during validation';
      default: return 'An unexpected error occurred during validation';
    }
  }
  
  private getErrorSuggestions(status: number): string[] {
    switch (status) {
      case 401:
        return [
          'Verify the API key is correct and not expired',
          'Check if the key has been revoked or regenerated',
          'Ensure you\'re using the correct key for this provider'
        ];
      case 403:
        return [
          'Check if your API key has the necessary permissions',
          'Verify your account status with the provider',
          'Ensure you\'re accessing the correct API endpoint'
        ];
      case 429:
        return [
          'Wait before making another request',
          'Implement exponential backoff in your application',
          'Consider upgrading your API plan for higher limits'
        ];
      case 500:
        return [
          'Try the request again in a few moments',
          'Check the provider\'s status page for service issues',
          'Contact provider support if the issue persists'
        ];
      default:
        return [
          'Check your network connection',
          'Try the validation again',
          'Review the error details for more information'
        ];
    }
  }
}
```

## CLI Command API

### Command Structure

The CLI provides both interactive and headless modes with comprehensive flag support.

```typescript
/**
 * CLI command interface defining available commands and options
 */
interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  action: (args: CommandArgs) => Promise<void>;
}

interface CLIOption {
  flag: string;
  description: string;
  type: 'string' | 'boolean' | 'number';
  default?: unknown;
  required?: boolean;
  choices?: string[];
}

interface CommandArgs {
  provider?: ProviderType;
  apiKey?: string;
  json?: boolean;
  timeout?: number;
  verbose?: boolean;
  config?: string;
  [key: string]: unknown;
}
```

### Available CLI Commands

#### Main Validation Command

```bash
# Interactive mode (default)
ai-key-validator

# Provider-specific validation
ai-key-validator -p openai --api-key sk-1234567890abcdef...
ai-key-validator --provider anthropic --api-key sk-ant-api03-...
ai-key-validator -p gemini --api-key AIza...

# Using environment variables
export OPENAI_API_KEY=sk-1234567890abcdef...
ai-key-validator -p openai

# JSON output for automation
ai-key-validator -p openai --api-key sk-... --json

# With custom timeout
ai-key-validator -p openai --api-key sk-... --timeout 60

# Verbose output
ai-key-validator -p openai --api-key sk-... --verbose
```

#### Available Flags

| Flag | Short | Type | Description | Default |
|------|-------|------|-------------|---------|
| `--provider` | `-p` | string | AI provider (openai\|anthropic\|gemini) | - |
| `--api-key` | `-k` | string | API key to validate | - |
| `--json` | - | boolean | Output results in JSON format | false |
| `--timeout` | `-t` | number | Request timeout in seconds | 30 |
| `--verbose` | `-v` | boolean | Enable verbose output | false |
| `--config` | `-c` | string | Path to configuration file | - |
| `--no-cache` | - | boolean | Bypass result cache | false |
| `--benchmark` | - | boolean | Enable performance benchmarking | false |
| `--help` | `-h` | boolean | Show help information | false |
| `--version` | `-V` | boolean | Show version information | false |

#### Utility Commands

```bash
# Show version information
ai-key-validator --version
ai-key-validator -V

# Show help
ai-key-validator --help
ai-key-validator -h

# Health check
ai-key-validator --health-check

# List available providers
ai-key-validator --list-providers

# Validate configuration file
ai-key-validator --validate-config ./aikeys.config.json
```

### Exit Codes

The CLI follows standard Unix exit code conventions:

| Exit Code | Description | When It Occurs |
|-----------|-------------|----------------|
| `0` | Success | Valid API key, operation completed successfully |
| `1` | Invalid Key | API key is invalid, malformed, or expired |
| `2` | System Error | Network error, configuration error, or system failure |
| `130` | User Interrupt | User cancelled operation (Ctrl+C) |

### JSON Output Format

When using the `--json` flag, output follows this standardized format:

```typescript
// Successful validation
{
  "valid": true,
  "provider": "openai",
  "status": 200,
  "timestamp": "2024-08-25T10:30:00.000Z",
  "timing": {
    "total": 1234,
    "pattern": 2,
    "network": 1200,
    "parsing": 32
  },
  "metadata": {
    "strategy": "live",
    "endpoint": "https://api.openai.com/v1/models",
    "cached": false
  }
}

// Failed validation
{
  "valid": false,
  "provider": "openai",
  "status": 401,
  "timestamp": "2024-08-25T10:30:00.000Z",
  "errors": [
    {
      "code": "INVALID_KEY",
      "message": "API key is invalid or expired",
      "suggestions": [
        "Verify the API key is correct and not expired",
        "Check if the key has been revoked or regenerated"
      ]
    }
  ],
  "timing": {
    "total": 856,
    "pattern": 1,
    "network": 850,
    "parsing": 5
  }
}

// System error
{
  "error": true,
  "code": "NETWORK_ERROR",
  "message": "Unable to connect to API server",
  "timestamp": "2024-08-25T10:30:00.000Z",
  "suggestions": [
    "Check your internet connection",
    "Verify DNS settings",
    "Try again in a few moments"
  ]
}
```

### Interactive Mode Flow

```typescript
/**
 * Interactive mode provides a guided experience for users
 */
interface InteractiveSession {
  // Main menu options
  showMainMenu(): Promise<'validate' | 'batch' | 'config' | 'exit'>;
  
  // Provider selection
  selectProvider(): Promise<ProviderType>;
  
  // Secure key input
  inputApiKey(): Promise<SecureString>;
  
  // Display results
  showResults(result: ValidationResult): void;
  
  // Batch validation flow
  runBatchValidation(): Promise<void>;
  
  // Configuration management
  configureSettings(): Promise<void>;
}
```

### Environment Variable Support

The CLI recognizes and uses these environment variables:

#### API Key Variables
```bash
# Standard provider API key variables
OPENAI_API_KEY=sk-1234567890abcdef...
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIza...

# Custom provider keys (if plugins registered)
CUSTOM_PROVIDER_API_KEY=custom-key...
```

#### Configuration Variables
```bash
# Tool configuration
AIKEYS_DEFAULT_PROVIDER=openai
AIKEYS_TIMEOUT=30
AIKEYS_CONFIG_PATH=/path/to/config.json
AIKEYS_LOG_LEVEL=info
AIKEYS_CACHE_SIZE=1000

# Output formatting
NO_COLOR=1                    # Disable colored output
AIKEYS_OUTPUT_FORMAT=json     # Default output format
```

#### Precedence Order

Configuration values are resolved in this order (highest to lowest priority):

1. Command-line flags (`--provider openai`)
2. Environment variables (`AIKEYS_DEFAULT_PROVIDER=openai`)
3. Configuration file settings
4. Built-in defaults

## Security API

### SecureString Class

Secure memory management for sensitive data like API keys.

```typescript
/**
 * Secure string implementation with automatic cleanup
 * @class SecureString
 */
export class SecureString {
  private buffer: Buffer;
  private disposed: boolean = false;
  
  /**
   * Creates a secure string from plain text
   * @param value - The string value to secure
   * 
   * @example
   * ```typescript
   * const secureKey = new SecureString('sk-1234567890abcdef...');
   * 
   * // Use the secure string
   * const result = await validator.validate(secureKey.toString(), 'openai');
   * 
   * // Cleanup (automatic on garbage collection or explicit)
   * secureKey.dispose();
   * ```
   */
  constructor(value: string);
  
  /**
   * Returns the string value (use sparingly)
   * @returns The original string value
   * @throws {Error} If already disposed
   */
  toString(): string;
  
  /**
   * Gets the length of the string without exposing content
   * @returns String length
   */
  get length(): number;
  
  /**
   * Checks if the string is disposed
   * @returns True if disposed
   */
  get isDisposed(): boolean;
  
  /**
   * Securely disposes of the string data
   * Overwrites memory with random data before deallocation
   */
  dispose(): void;
  
  /**
   * Creates a secure copy of the string
   * @returns New SecureString instance
   */
  clone(): SecureString;
  
  /**
   * Compares with another SecureString in constant time
   * @param other - SecureString to compare with
   * @returns True if strings are equal
   */
  equals(other: SecureString): boolean;
}
```

### SecurityManager Class

Manages security operations and policies.

```typescript
/**
 * Manages security operations and enforcement
 * @class SecurityManager
 */
export class SecurityManager {
  private auditLogger: AuditLogger;
  private memoryManager: SecureMemoryManager;
  
  constructor(config: SecurityConfig);
  
  /**
   * Creates secure input handler for API keys
   * @param prompt - Input prompt message
   * @param options - Input options
   * @returns Promise resolving to SecureString
   * 
   * @example
   * ```typescript
   * const securityManager = new SecurityManager(config);
   * 
   * const secureKey = await securityManager.secureInput(
   *   'Enter your OpenAI API key: ',
   *   {
   *     mask: '*',
   *     timeout: 120000,
   *     maxLength: 100
   *   }
   * );
   * ```
   */
  async secureInput(prompt: string, options: SecureInputOptions): Promise<SecureString>;
  
  /**
   * Validates input for security issues
   * @param input - Input to validate
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const validation = securityManager.validateInput(userInput);
   * if (!validation.safe) {
   *   console.log('Security issues detected:', validation.issues);
   * }
   * ```
   */
  validateInput(input: string): InputValidationResult;
  
  /**
   * Sanitizes error messages to prevent information leakage
   * @param error - Original error
   * @returns Sanitized error safe for display
   */
  sanitizeError(error: Error): Error;
  
  /**
   * Logs security events for audit purposes
   * @param event - Security event to log
   * 
   * @example
   * ```typescript
   * securityManager.auditLog({
   *   action: 'validation_attempt',
   *   result: 'success',
   *   provider: 'openai',
   *   timestamp: new Date(),
   *   metadata: { responseTime: 1200 }
   * });
   * ```
   */
  auditLog(event: SecurityEvent): void;
  
  /**
   * Performs secure memory cleanup
   * @example
   * ```typescript
   * // Cleanup on application shutdown
   * process.on('SIGINT', () => {
   *   securityManager.cleanup();
   *   process.exit(0);
   * });
   * ```
   */
  cleanup(): void;
  
  /**
   * Gets security metrics and statistics
   * @returns Security metrics
   */
  getSecurityMetrics(): SecurityMetrics;
}

interface SecureInputOptions {
  /** Character to display instead of actual input */
  mask: string;
  
  /** Maximum input length */
  maxLength: number;
  
  /** Input timeout in milliseconds */
  timeout: number;
  
  /** Custom input validation function */
  validate?: (input: string) => boolean;
  
  /** Allow clipboard paste */
  allowPaste: boolean;
}

interface InputValidationResult {
  /** Whether input is safe to use */
  safe: boolean;
  
  /** Detected security issues */
  issues: string[];
  
  /** Sanitized version of input */
  sanitized: string;
}

interface SecurityEvent {
  /** Action being performed */
  action: string;
  
  /** Result of the action */
  result: 'success' | 'failure' | 'error';
  
  /** Provider involved (if applicable) */
  provider?: ProviderType;
  
  /** Event timestamp */
  timestamp: Date;
  
  /** Additional metadata (will be sanitized) */
  metadata?: Record<string, unknown>;
  
  /** Session identifier */
  sessionId?: string;
}

interface SecurityMetrics {
  /** Total security events logged */
  totalEvents: number;
  
  /** Events by type */
  eventsByType: Record<string, number>;
  
  /** Recent security issues */
  recentIssues: SecurityEvent[];
  
  /** Memory usage statistics */
  memoryStats: {
    allocatedSecureMemory: number;
    cleanupEvents: number;
    leakDetections: number;
  };
}
```

### Memory Management

```typescript
/**
 * Secure memory management utilities
 * @class SecureMemoryManager
 */
export class SecureMemoryManager {
  private static instances: Set<SecureString> = new Set();
  private cleanupTimer: NodeJS.Timer;
  
  /**
   * Register SecureString for automatic cleanup
   * @param instance - SecureString to register
   */
  static register(instance: SecureString): void;
  
  /**
   * Perform immediate cleanup of all registered instances
   */
  static cleanup(): void;
  
  /**
   * Start automatic cleanup timer
   * @param interval - Cleanup interval in milliseconds
   */
  static startAutoCleanup(interval: number = 60000): void;
  
  /**
   * Stop automatic cleanup timer
   */
  static stopAutoCleanup(): void;
  
  /**
   * Get memory usage statistics
   * @returns Memory statistics
   */
  static getMemoryStats(): MemoryStats;
}

interface MemoryStats {
  /** Number of active SecureString instances */
  activeInstances: number;
  
  /** Total secure memory allocated in bytes */
  totalAllocated: number;
  
  /** Number of cleanup operations performed */
  cleanupCount: number;
  
  /** Last cleanup timestamp */
  lastCleanup: Date;
}
```

## Configuration API

### Configuration File Format

The validator supports both JSON and YAML configuration files.

#### JSON Configuration Example

```json
{
  "providers": [
    {
      "type": "openai",
      "enabled": true,
      "timeout": 30000,
      "retries": 3,
      "rateLimits": {
        "requestsPerMinute": 60,
        "requestsPerHour": 1000,
        "backoffStrategy": "exponential"
      }
    },
    {
      "type": "anthropic",
      "enabled": true,
      "timeout": 30000,
      "retries": 3,
      "rateLimits": {
        "requestsPerMinute": 50,
        "requestsPerHour": 800,
        "backoffStrategy": "exponential"
      }
    }
  ],
  "security": {
    "auditLogging": true,
    "memoryPoolSize": 10,
    "inputTimeout": 120000,
    "maxKeyLength": 200
  },
  "performance": {
    "cacheSize": 1000,
    "cacheTTL": 300000,
    "maxConcurrentRequests": 10,
    "requestTimeout": 30000,
    "monitoring": true
  },
  "cli": {
    "colors": true,
    "interactiveMode": true,
    "outputFormat": "text",
    "verbosity": "normal"
  }
}
```

#### YAML Configuration Example

```yaml
providers:
  - type: openai
    enabled: true
    timeout: 30000
    retries: 3
    rateLimits:
      requestsPerMinute: 60
      requestsPerHour: 1000
      backoffStrategy: exponential

  - type: anthropic
    enabled: true
    timeout: 30000
    retries: 3
    rateLimits:
      requestsPerMinute: 50
      requestsPerHour: 800
      backoffStrategy: exponential

security:
  auditLogging: true
  memoryPoolSize: 10
  inputTimeout: 120000
  maxKeyLength: 200

performance:
  cacheSize: 1000
  cacheTTL: 300000
  maxConcurrentRequests: 10
  requestTimeout: 30000
  monitoring: true

cli:
  colors: true
  interactiveMode: true
  outputFormat: text
  verbosity: normal
```

### ConfigManager Class

```typescript
/**
 * Configuration management and loading
 * @class ConfigManager
 */
export class ConfigManager {
  private config: ValidatorConfig;
  private configPaths: string[];
  
  /**
   * Creates a new configuration manager
   * @param customPaths - Optional custom configuration file paths
   */
  constructor(customPaths?: string[]);
  
  /**
   * Loads configuration from multiple sources
   * @returns Promise resolving to merged configuration
   * 
   * @example
   * ```typescript
   * const configManager = new ConfigManager();
   * const config = await configManager.loadConfig();
   * 
   * const validator = new AIKeyValidator(config);
   * ```
   */
  async loadConfig(): Promise<ValidatorConfig>;
  
  /**
   * Loads configuration from specific file
   * @param filePath - Path to configuration file
   * @returns Promise resolving to configuration object
   */
  async loadFromFile(filePath: string): Promise<ValidatorConfig>;
  
  /**
   * Validates configuration object
   * @param config - Configuration to validate
   * @returns Validation result
   * 
   * @example
   * ```typescript
   * const validation = configManager.validateConfig(userConfig);
   * if (!validation.valid) {
   *   console.error('Configuration errors:', validation.errors);
   *   validation.errors.forEach(error => {
   *     console.error(`  ${error.path}: ${error.message}`);
   *   });
   * }
   * ```
   */
  validateConfig(config: ValidatorConfig): ConfigValidationResult;
  
  /**
   * Gets default configuration
   * @returns Default configuration object
   */
  getDefaultConfig(): ValidatorConfig;
  
  /**
   * Merges multiple configuration objects
   * @param configs - Configuration objects to merge
   * @returns Merged configuration
   */
  mergeConfigs(...configs: Partial<ValidatorConfig>[]): ValidatorConfig;
  
  /**
   * Saves configuration to file
   * @param config - Configuration to save
   * @param filePath - Output file path
   * @param format - File format (json or yaml)
   */
  async saveConfig(
    config: ValidatorConfig,
    filePath: string,
    format: 'json' | 'yaml' = 'json'
  ): Promise<void>;
}

interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigError[];
  warnings: ConfigWarning[];
}

interface ConfigError {
  path: string;
  message: string;
  value?: unknown;
}

interface ConfigWarning {
  path: string;
  message: string;
  suggestion?: string;
}
```

### Environment Variable Configuration

```typescript
/**
 * Environment variable configuration loader
 * @class EnvironmentConfig
 */
export class EnvironmentConfig {
  /**
   * Loads configuration from environment variables
   * @returns Partial configuration from environment
   * 
   * @example
   * ```typescript
   * // Set environment variables
   * process.env.AIKEYS_TIMEOUT = '60';
   * process.env.AIKEYS_CACHE_SIZE = '2000';
   * process.env.NO_COLOR = '1';
   * 
   * const envConfig = EnvironmentConfig.load();
   * console.log(envConfig.performance.requestTimeout); // 60000
   * ```
   */
  static load(): Partial<ValidatorConfig>;
  
  /**
   * Gets API key from environment for specific provider
   * @param provider - Provider type
   * @returns API key if found
   * 
   * @example
   * ```typescript
   * const openaiKey = EnvironmentConfig.getApiKey('openai');
   * if (openaiKey) {
   *   const result = await validator.validate(openaiKey, 'openai');
   * }
   * ```
   */
  static getApiKey(provider: ProviderType): string | undefined;
  
  /**
   * Gets typed configuration value from environment
   * @param key - Environment variable key
   * @param defaultValue - Default value and type hint
   * @returns Typed configuration value
   */
  static getConfigValue<T>(key: string, defaultValue: T): T;
  
  /**
   * Validates all environment variables
   * @returns Validation result
   */
  static validate(): EnvironmentValidationResult;
}

interface EnvironmentValidationResult {
  valid: boolean;
  invalidVariables: string[];
  suggestions: Record<string, string>;
}
```

## Error Handling API

### Error Classification System

```typescript
/**
 * Comprehensive error categories for classification
 */
enum ValidationErrorCode {
  // Pattern validation errors
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_LENGTH = 'INVALID_LENGTH',
  INVALID_PREFIX = 'INVALID_PREFIX',
  INVALID_CHARACTERS = 'INVALID_CHARACTERS',
  
  // Live validation errors
  INVALID_KEY = 'INVALID_KEY',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RATE_LIMITED = 'RATE_LIMITED',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  DNS_RESOLUTION_FAILED = 'DNS_RESOLUTION_FAILED',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',
  
  // System errors
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  SECURITY_ERROR = 'SECURITY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Error categories for high-level classification
 */
enum ErrorCategory {
  VALIDATION_ERROR = 'validation',
  NETWORK_ERROR = 'network',
  API_ERROR = 'api',
  SECURITY_ERROR = 'security',
  CONFIGURATION_ERROR = 'configuration',
  PLUGIN_ERROR = 'plugin',
  SYSTEM_ERROR = 'system'
}
```

### Custom Error Classes

```typescript
/**
 * Base validation error with enhanced information
 * @class ValidationError
 */
export class ValidationError extends Error {
  readonly code: ValidationErrorCode;
  readonly category: ErrorCategory;
  readonly recoverable: boolean;
  readonly suggestions: string[];
  readonly context: Record<string, unknown>;
  
  constructor(
    code: ValidationErrorCode,
    message: string,
    options: {
      category?: ErrorCategory;
      recoverable?: boolean;
      suggestions?: string[];
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.category = options.category || this.inferCategory(code);
    this.recoverable = options.recoverable ?? this.inferRecoverable(code);
    this.suggestions = options.suggestions || [];
    this.context = options.context || {};
    
    if (options.cause) {
      this.cause = options.cause;
    }
  }
  
  private inferCategory(code: ValidationErrorCode): ErrorCategory {
    // Implementation to map error codes to categories
  }
  
  private inferRecoverable(code: ValidationErrorCode): boolean {
    // Implementation to determine if error is recoverable
  }
}

/**
 * Provider-specific error for plugin-related issues
 * @class ProviderError
 */
export class ProviderError extends ValidationError {
  readonly provider: ProviderType;
  
  constructor(
    provider: ProviderType,
    code: ValidationErrorCode,
    message: string,
    options?: {
      recoverable?: boolean;
      suggestions?: string[];
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(code, message, { ...options, category: ErrorCategory.PLUGIN_ERROR });
    this.name = 'ProviderError';
    this.provider = provider;
  }
}

/**
 * Network-related errors with detailed information
 * @class NetworkError
 */
export class NetworkError extends ValidationError {
  readonly url?: string;
  readonly statusCode?: number;
  readonly responseTime?: number;
  
  constructor(
    message: string,
    options: {
      url?: string;
      statusCode?: number;
      responseTime?: number;
      cause?: Error;
    } = {}
  ) {
    super(
      ValidationErrorCode.NETWORK_ERROR,
      message,
      {
        category: ErrorCategory.NETWORK_ERROR,
        recoverable: true,
        suggestions: [
          'Check your internet connection',
          'Verify the API endpoint is accessible',
          'Try again in a few moments'
        ],
        context: {
          url: options.url,
          statusCode: options.statusCode,
          responseTime: options.responseTime
        },
        cause: options.cause
      }
    );
    this.name = 'NetworkError';
    this.url = options.url;
    this.statusCode = options.statusCode;
    this.responseTime = options.responseTime;
  }
}
```

### Error Handler System

```typescript
/**
 * Comprehensive error handling and recovery system
 * @class ErrorHandler
 */
export class ErrorHandler {
  private recoveryStrategies: Map<ErrorCategory, RecoveryStrategy>;
  private errorClassifier: ErrorClassifier;
  
  constructor() {
    this.errorClassifier = new ErrorClassifier();
    this.setupRecoveryStrategies();
  }
  
  /**
   * Handles errors with classification and recovery
   * @param error - Error to handle
   * @param context - Additional context
   * @returns Handled error result
   * 
   * @example
   * ```typescript
   * const errorHandler = new ErrorHandler();
   * 
   * try {
   *   await validator.validate(apiKey, provider);
   * } catch (error) {
   *   const result = await errorHandler.handle(error, {
   *     operation: 'validation',
   *     provider: 'openai',
   *     retryable: true
   *   });
   *   
   *   if (result.recovered) {
   *     console.log('✅ Error recovered:', result.result);
   *   } else {
   *     console.error('❌ Error not recoverable:', result.error);
   *     result.error.suggestions.forEach(suggestion => {
   *       console.log(`💡 ${suggestion}`);
   *     });
   *   }
   * }
   * ```
   */
  async handle(error: Error, context: ErrorContext): Promise<ErrorHandlingResult>;
  
  /**
   * Classifies errors into categories with detailed information
   * @param error - Error to classify
   * @returns Error classification
   */
  classify(error: Error): ErrorClassification;
  
  /**
   * Attempts recovery for recoverable errors
   * @param error - Error to recover from
   * @param context - Error context
   * @returns Recovery result
   */
  private async attemptRecovery(
    error: ValidationError,
    context: ErrorContext
  ): Promise<RecoveryResult>;
  
  /**
   * Formats error messages for user display
   * @param error - Error to format
   * @param format - Output format
   * @returns Formatted error message
   */
  formatError(error: ValidationError, format: 'text' | 'json' = 'text'): string;
}

interface ErrorContext {
  operation: string;
  provider?: ProviderType;
  retryable: boolean;
  metadata?: Record<string, unknown>;
}

interface ErrorHandlingResult {
  recovered: boolean;
  error: ValidationError;
  result?: ValidationResult;
  recoveryAttempts: number;
}

interface ErrorClassification {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userFacing: boolean;
  suggestions: string[];
}

interface RecoveryResult {
  success: boolean;
  result?: ValidationResult;
  error?: Error;
  attempts: number;
}
```

### Recovery Strategies

```typescript
/**
 * Recovery strategy interface
 */
interface RecoveryStrategy {
  canRecover(error: ValidationError): boolean;
  recover(error: ValidationError, context: ErrorContext): Promise<RecoveryResult>;
}

/**
 * Network error recovery with exponential backoff
 * @class NetworkRecoveryStrategy
 */
export class NetworkRecoveryStrategy implements RecoveryStrategy {
  private maxRetries = 3;
  private baseDelay = 1000;
  
  canRecover(error: ValidationError): boolean {
    return error.category === ErrorCategory.NETWORK_ERROR && 
           error.recoverable &&
           error.code !== ValidationErrorCode.DNS_RESOLUTION_FAILED;
  }
  
  async recover(error: ValidationError, context: ErrorContext): Promise<RecoveryResult> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Wait with exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the original operation
        const result = await context.retryOperation();
        
        return {
          success: true,
          result,
          attempts: attempt
        };
      } catch (retryError) {
        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: retryError as Error,
            attempts: attempt
          };
        }
      }
    }
  }
}

/**
 * Rate limit recovery with intelligent backoff
 * @class RateLimitRecoveryStrategy
 */
export class RateLimitRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: ValidationError): boolean {
    return error.code === ValidationErrorCode.RATE_LIMITED;
  }
  
  async recover(error: ValidationError, context: ErrorContext): Promise<RecoveryResult> {
    // Extract rate limit information from error context
    const resetTime = error.context.rateLimitReset as Date;
    const delay = resetTime ? resetTime.getTime() - Date.now() : 60000;
    
    if (delay > 300000) { // Don't wait more than 5 minutes
      return {
        success: false,
        error: new ValidationError(
          ValidationErrorCode.RATE_LIMITED,
          'Rate limit reset time is too far in the future'
        ),
        attempts: 1
      };
    }
    
    // Wait for rate limit reset
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      const result = await context.retryOperation();
      return {
        success: true,
        result,
        attempts: 1
      };
    } catch (retryError) {
      return {
        success: false,
        error: retryError as Error,
        attempts: 1
      };
    }
  }
}
```

### Error Message Formatting

```typescript
/**
 * Error message formatter with multiple output formats
 * @class ErrorFormatter
 */
export class ErrorFormatter {
  /**
   * Formats error for console display with colors
   * @param error - Error to format
   * @returns Formatted error message
   */
  formatConsole(error: ValidationError): string {
    const icon = this.getErrorIcon(error.code);
    const colorFn = this.getColorFunction(error.category);
    
    let message = `${icon} ${colorFn(error.message)}\n`;
    
    if (error.suggestions.length > 0) {
      message += '\n💡 Suggestions:\n';
      error.suggestions.forEach(suggestion => {
        message += `   • ${suggestion}\n`;
      });
    }
    
    if (process.env.NODE_ENV === 'development' && error.context) {
      message += `\n🔍 Context: ${JSON.stringify(error.context, null, 2)}`;
    }
    
    return message;
  }
  
  /**
   * Formats error for JSON output
   * @param error - Error to format
   * @returns JSON error object
   */
  formatJSON(error: ValidationError): Record<string, unknown> {
    return {
      error: true,
      code: error.code,
      category: error.category,
      message: error.message,
      recoverable: error.recoverable,
      suggestions: error.suggestions,
      context: this.sanitizeContext(error.context),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Formats error for logging (sanitized)
   * @param error - Error to format
   * @returns Log-safe error message
   */
  formatLog(error: ValidationError): string {
    return JSON.stringify({
      code: error.code,
      category: error.category,
      message: error.message,
      recoverable: error.recoverable,
      context: this.sanitizeContext(error.context),
      timestamp: new Date().toISOString()
    });
  }
  
  private getErrorIcon(code: ValidationErrorCode): string {
    switch (code) {
      case ValidationErrorCode.INVALID_KEY: return '🔑';
      case ValidationErrorCode.NETWORK_ERROR: return '🌐';
      case ValidationErrorCode.RATE_LIMITED: return '⏱️';
      case ValidationErrorCode.SERVER_ERROR: return '🔧';
      default: return '❌';
    }
  }
  
  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...context };
    
    // Remove sensitive information
    const sensitiveKeys = ['key', 'apiKey', 'secret', 'password', 'token'];
    sensitiveKeys.forEach(key => {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
```

## Provider Specifications

### OpenAI Provider

```typescript
/**
 * OpenAI provider specification and implementation details
 */
interface OpenAIProviderSpec {
  /** Provider type identifier */
  type: 'openai';
  
  /** API key pattern */
  keyPattern: /^sk-[A-Za-z0-9]{48}$/;
  
  /** Validation endpoint */
  validationEndpoint: 'https://api.openai.com/v1/models';
  
  /** HTTP method for validation */
  method: 'GET';
  
  /** Required headers */
  headers: {
    'Authorization': `Bearer ${apiKey}`;
    'Content-Type': 'application/json';
    'User-Agent': 'ai-key-validator/1.0.0';
  };
  
  /** Rate limits */
  rateLimits: {
    requestsPerMinute: 60;
    requestsPerHour: 1000;
    burstLimit: 10;
  };
  
  /** Response codes */
  responseCodes: {
    200: 'Valid key';
    401: 'Invalid or expired key';
    429: 'Rate limit exceeded';
    500: 'Server error';
  };
  
  /** Error handling patterns */
  errorPatterns: {
    invalidKey: /invalid.*api.*key/i;
    rateLimited: /rate.*limit.*exceeded/i;
    quotaExceeded: /quota.*exceeded/i;
  };
}

/**
 * Example OpenAI validation request and response
 */
const openaiExample = {
  request: {
    method: 'GET',
    url: 'https://api.openai.com/v1/models',
    headers: {
      'Authorization': 'Bearer sk-1234567890abcdef...',
      'Content-Type': 'application/json',
      'User-Agent': 'ai-key-validator/1.0.0'
    }
  },
  
  validResponse: {
    status: 200,
    data: {
      object: 'list',
      data: [
        {
          id: 'gpt-3.5-turbo',
          object: 'model',
          created: 1677610602,
          owned_by: 'openai'
        }
      ]
    }
  },
  
  invalidResponse: {
    status: 401,
    data: {
      error: {
        message: 'Invalid API key provided',
        type: 'invalid_request_error',
        param: null,
        code: 'invalid_api_key'
      }
    }
  }
};
```

### Anthropic (Claude) Provider

```typescript
/**
 * Anthropic provider specification and implementation details
 */
interface AnthropicProviderSpec {
  /** Provider type identifier */
  type: 'anthropic';
  
  /** API key pattern */
  keyPattern: /^sk-ant-[A-Za-z0-9\-_]{95}$/;
  
  /** Validation endpoint */
  validationEndpoint: 'https://api.anthropic.com/v1/messages';
  
  /** HTTP method for validation */
  method: 'POST';
  
  /** Required headers */
  headers: {
    'x-api-key': apiKey;
    'Content-Type': 'application/json';
    'anthropic-version': '2023-06-01';
  };
  
  /** Minimal test request body */
  testRequestBody: {
    model: 'claude-3-haiku-20240307';
    max_tokens: 1;
    messages: [{ role: 'user', content: 'ping' }];
  };
  
  /** Rate limits */
  rateLimits: {
    requestsPerMinute: 50;
    requestsPerHour: 800;
    burstLimit: 5;
  };
  
  /** Response codes */
  responseCodes: {
    200: 'Valid key';
    400: 'Bad request';
    401: 'Invalid key';
    403: 'Forbidden';
    429: 'Rate limit exceeded';
    500: 'Server error';
  };
}

/**
 * Example Anthropic validation request and response
 */
const anthropicExample = {
  request: {
    method: 'POST',
    url: 'https://api.anthropic.com/v1/messages',
    headers: {
      'x-api-key': 'sk-ant-api03-1234567890abcdef...',
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }]
    }
  },
  
  validResponse: {
    status: 200,
    data: {
      id: 'msg_123',
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: 'pong'
        }
      ],
      model: 'claude-3-haiku-20240307',
      stop_reason: 'max_tokens',
      usage: {
        input_tokens: 8,
        output_tokens: 1
      }
    }
  },
  
  invalidResponse: {
    status: 401,
    data: {
      type: 'error',
      error: {
        type: 'authentication_error',
        message: 'Invalid API key'
      }
    }
  }
};
```

### Google Gemini Provider

```typescript
/**
 * Google Gemini provider specification and implementation details
 */
interface GeminiProviderSpec {
  /** Provider type identifier */
  type: 'gemini';
  
  /** API key pattern (Google API key format) */
  keyPattern: /^AIza[0-9A-Za-z\-_]{35}$/;
  
  /** Validation endpoint */
  validationEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  /** HTTP method for validation */
  method: 'POST';
  
  /** Required headers */
  headers: {
    'Content-Type': 'application/json';
  };
  
  /** API key in URL parameter */
  apiKeyParam: `key=${apiKey}`;
  
  /** Minimal test request body */
  testRequestBody: {
    contents: [
      {
        parts: [{ text: 'ping' }]
      }
    ],
    generationConfig: {
      maxOutputTokens: 1
    }
  };
  
  /** Rate limits */
  rateLimits: {
    requestsPerMinute: 60;
    requestsPerHour: 1000;
    burstLimit: 15;
  };
  
  /** Response codes */
  responseCodes: {
    200: 'Valid key';
    400: 'Bad request';
    403: 'API key invalid or quotas exceeded';
    429: 'Rate limit exceeded';
    500: 'Server error';
  };
}

/**
 * Example Gemini validation request and response
 */
const geminiExample = {
  request: {
    method: 'POST',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIza1234567890abcdef...',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      contents: [
        {
          parts: [{ text: 'ping' }]
        }
      ],
      generationConfig: {
        maxOutputTokens: 1
      }
    }
  },
  
  validResponse: {
    status: 200,
    data: {
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'pong'
              }
            ],
            role: 'model'
          },
          finishReason: 'MAX_TOKENS',
          index: 0,
          safetyRatings: []
        }
      ],
      promptFeedback: {
        safetyRatings: []
      }
    }
  },
  
  invalidResponse: {
    status: 403,
    data: {
      error: {
        code: 403,
        message: 'API key not valid. Please pass a valid API key.',
        status: 'PERMISSION_DENIED'
      }
    }
  }
};
```

## Code Examples

### Basic Usage Examples

#### Simple Validation

```typescript
import { AIKeyValidator } from 'ai-key-validator';

// Create validator instance
const validator = new AIKeyValidator();

// Validate OpenAI key
async function validateOpenAIKey() {
  try {
    const result = await validator.validate('sk-1234567890abcdef...', 'openai');
    
    if (result.valid) {
      console.log('✅ OpenAI key is valid');
      console.log(`Validated in ${result.timing?.total}ms`);
    } else {
      console.log('❌ OpenAI key is invalid');
      result.errors.forEach(error => {
        console.log(`Error: ${error.message}`);
      });
    }
  } catch (error) {
    console.error('Validation failed:', error);
  }
}

validateOpenAIKey();
```

#### Pattern-Only Validation

```typescript
import { AIKeyValidator } from 'ai-key-validator';

const validator = new AIKeyValidator();

// Quick pattern validation without API calls
function validateKeyFormat() {
  const keys = [
    { key: 'sk-1234567890abcdef...', provider: 'openai' },
    { key: 'sk-ant-api03-1234567890abcdef...', provider: 'anthropic' },
    { key: 'AIza1234567890abcdef...', provider: 'gemini' }
  ];
  
  keys.forEach(({ key, provider }) => {
    const result = validator.validatePattern(key, provider as any);
    console.log(`${provider}: ${result.valid ? '✅' : '❌'}`);
    
    if (!result.valid) {
      result.errors.forEach(error => {
        console.log(`  ${error.code}: ${error.message}`);
      });
    }
  });
}

validateKeyFormat();
```

### Advanced Usage Examples

#### Batch Validation with Error Handling

```typescript
import { AIKeyValidator, ValidationRequest } from 'ai-key-validator';

async function batchValidation() {
  const validator = new AIKeyValidator({
    performance: {
      cacheSize: 1000,
      maxConcurrentRequests: 5
    }
  });
  
  const requests: ValidationRequest[] = [
    { 
      id: 'openai-prod', 
      key: process.env.OPENAI_API_KEY!, 
      provider: 'openai' 
    },
    { 
      id: 'claude-prod', 
      key: process.env.ANTHROPIC_API_KEY!, 
      provider: 'anthropic' 
    },
    { 
      id: 'gemini-prod', 
      key: process.env.GEMINI_API_KEY!, 
      provider: 'gemini' 
    }
  ];
  
  try {
    const results = await validator.validateBatch(requests, {
      concurrency: 3,
      continueOnError: true,
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total}`);
      }
    });
    
    // Analyze results
    const summary = results.reduce((acc, result, index) => {
      const request = requests[index];
      if (result.valid) {
        acc.valid.push(request.id!);
      } else {
        acc.invalid.push({
          id: request.id!,
          errors: result.errors.map(e => e.message)
        });
      }
      return acc;
    }, { valid: [] as string[], invalid: [] as any[] });
    
    console.log('✅ Valid keys:', summary.valid);
    console.log('❌ Invalid keys:', summary.invalid);
    
  } catch (error) {
    console.error('Batch validation failed:', error);
  }
}

batchValidation();
```

#### Custom Configuration

```typescript
import { AIKeyValidator, ValidatorConfig } from 'ai-key-validator';

async function configuredValidation() {
  const config: ValidatorConfig = {
    providers: [
      {
        type: 'openai',
        enabled: true,
        timeout: 10000,
        retries: 2,
        rateLimits: {
          requestsPerMinute: 30,
          requestsPerHour: 500,
          burstLimit: 5,
          backoffStrategy: 'exponential'
        }
      }
    ],
    security: {
      auditLogging: true,
      memoryPoolSize: 5,
      inputTimeout: 60000,
      maxKeyLength: 100,
      verifyCleanup: true
    },
    performance: {
      cacheSize: 500,
      cacheTTL: 600000, // 10 minutes
      maxConcurrentRequests: 3,
      requestTimeout: 10000,
      monitoring: true
    }
  };
  
  const validator = new AIKeyValidator(config);
  
  // Validation with custom timeout
  const result = await validator.validate(
    'sk-1234567890abcdef...',
    'openai',
    {
      timeout: 5000,
      strategy: 'live',
      enableTiming: true
    }
  );
  
  console.log('Validation result:', result);
  
  // Get performance metrics
  const metrics = validator.getPerformanceMetrics();
  console.log('Performance metrics:', {
    averageResponseTime: `${metrics.averageResponseTime}ms`,
    successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
    cacheHitRate: `${(metrics.cacheHitRate * 100).toFixed(1)}%`
  });
}

configuredValidation();
```

### Plugin Development Examples

#### Custom Provider Plugin

```typescript
import { BaseProviderPlugin, PatternValidationResult, LiveValidationResult } from 'ai-key-validator';

class CustomAIProvider extends BaseProviderPlugin {
  readonly name = 'Custom AI Service';
  readonly type = 'custom' as const;
  readonly version = '1.0.0';
  readonly apiVersion = 'v1';
  
  validatePattern(key: string): PatternValidationResult {
    // Custom key format: cust-[32 hex characters]
    const pattern = /^cust-[a-f0-9]{32}$/i;
    const valid = pattern.test(key);
    
    return {
      valid,
      format: 'custom-hex-32',
      errors: valid ? [] : [{
        code: 'INVALID_FORMAT',
        message: 'Custom AI keys must start with "cust-" followed by 32 hexadecimal characters',
        suggestions: [
          'Check that your key starts with "cust-"',
          'Ensure the key contains exactly 32 hexadecimal characters (0-9, a-f)',
          'Verify the key format with your Custom AI dashboard'
        ]
      }]
    };
  }
  
  async validateLive(key: string, options?: any): Promise<LiveValidationResult> {
    try {
      const request = this.getTestRequest(key);
      const response = await this.makeRequest(request, {
        timeout: options?.timeout || 30000
      });
      
      const result = this.parseResponse(response);
      
      return {
        valid: result.valid,
        status: response.status,
        response,
        metadata: {
          strategy: 'live',
          endpoint: request.url,
          responseTime: response.responseTime
        }
      };
    } catch (error) {
      return {
        valid: false,
        status: 0,
        response: null,
        metadata: {
          strategy: 'live',
          error: this.handleError(error as Error, 'live-validation')
        }
      };
    }
  }
  
  getTestRequest(key: string) {
    return {
      url: 'https://api.customai.com/v1/health',
      method: 'GET' as const,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'X-Client': 'ai-key-validator/1.0.0'
      }
    };
  }
  
  parseResponse(response: any) {
    const valid = response.status === 200;
    const errors = [];
    
    if (!valid) {
      const errorMessage = this.getErrorMessage(response.status, response.data);
      errors.push(this.handleError(new Error(errorMessage), 'api-response'));
    }
    
    return this.createResult(valid, this.type, errors, {
      strategy: 'live',
      endpoint: response.url,
      providerData: {
        customField: response.data?.customField,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  getRateLimits() {
    return {
      requestsPerMinute: 120,
      requestsPerHour: 2000,
      burstLimit: 20,
      backoffStrategy: 'exponential' as const
    };
  }
  
  private getErrorMessage(status: number, data: any): string {
    switch (status) {
      case 401:
        return data?.error?.message || 'API key is invalid or expired';
      case 403:
        return 'API key does not have sufficient permissions';
      case 429:
        return 'Rate limit exceeded for this API key';
      case 500:
        return 'Custom AI service is experiencing issues';
      default:
        return `Unexpected response: ${status}`;
    }
  }
}

// Register and use the custom provider
import { PluginRegistry, AIKeyValidator } from 'ai-key-validator';

async function useCustomProvider() {
  // Register the plugin
  const registry = PluginRegistry.getInstance();
  registry.registerPlugin(new CustomAIProvider());
  
  // Use with validator
  const validator = new AIKeyValidator();
  
  const result = await validator.validate(
    'cust-1234567890abcdef1234567890abcdef',
    'custom' as any
  );
  
  console.log('Custom provider result:', result);
}

useCustomProvider();
```

### CI/CD Integration Examples

#### GitHub Actions Workflow

```yaml
# .github/workflows/validate-api-keys.yml
name: Validate API Keys

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Daily validation at 6 AM UTC
    - cron: '0 6 * * *'

jobs:
  validate-keys:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install AI Key Validator
        run: npm install -g ai-key-validator
      
      - name: Validate OpenAI Key
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          ai-key-validator -p openai --json > openai-result.json
          if [ $? -ne 0 ]; then
            echo "OpenAI key validation failed"
            cat openai-result.json
            exit 1
          fi
          echo "OpenAI key is valid"
      
      - name: Validate Anthropic Key
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          ai-key-validator -p anthropic --json > anthropic-result.json
          if [ $? -ne 0 ]; then
            echo "Anthropic key validation failed"
            cat anthropic-result.json
            exit 1
          fi
          echo "Anthropic key is valid"
      
      - name: Validate Gemini Key
        env:
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
        run: |
          ai-key-validator -p gemini --json > gemini-result.json
          if [ $? -ne 0 ]; then
            echo "Gemini key validation failed"
            cat gemini-result.json
            exit 1
          fi
          echo "Gemini key is valid"
      
      - name: Upload validation results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: validation-results
          path: '*-result.json'
```

#### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        OPENAI_API_KEY = credentials('openai-api-key')
        ANTHROPIC_API_KEY = credentials('anthropic-api-key')
        GEMINI_API_KEY = credentials('gemini-api-key')
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g ai-key-validator'
                sh 'ai-key-validator --version'
            }
        }
        
        stage('Validate API Keys') {
            parallel {
                stage('OpenAI') {
                    steps {
                        script {
                            def result = sh(
                                script: 'ai-key-validator -p openai --json',
                                returnStatus: true
                            )
                            if (result != 0) {
                                error("OpenAI key validation failed")
                            }
                            echo "OpenAI key is valid"
                        }
                    }
                }
                
                stage('Anthropic') {
                    steps {
                        script {
                            def result = sh(
                                script: 'ai-key-validator -p anthropic --json',
                                returnStatus: true
                            )
                            if (result != 0) {
                                error("Anthropic key validation failed")
                            }
                            echo "Anthropic key is valid"
                        }
                    }
                }
                
                stage('Gemini') {
                    steps {
                        script {
                            def result = sh(
                                script: 'ai-key-validator -p gemini --json',
                                returnStatus: true
                            )
                            if (result != 0) {
                                error("Gemini key validation failed")
                            }
                            echo "Gemini key is valid"
                        }
                    }
                }
            }
        }
        
        stage('Performance Check') {
            steps {
                sh '''
                    ai-key-validator -p openai --benchmark > performance.txt
                    cat performance.txt
                '''
                archiveArtifacts artifacts: 'performance.txt', fingerprint: true
            }
        }
    }
    
    post {
        always {
            sh 'ai-key-validator --health-check || true'
        }
        failure {
            emailext (
                subject: "API Key Validation Failed - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "API key validation failed. Check the build logs for details.",
                to: "${env.CHANGE_AUTHOR_EMAIL}"
            )
        }
    }
}
```

#### Docker Integration

```dockerfile
# Dockerfile for containerized validation
FROM node:20-alpine

# Install ai-key-validator globally
RUN npm install -g ai-key-validator

# Create app directory
WORKDIR /app

# Copy validation scripts
COPY validate-keys.sh .
RUN chmod +x validate-keys.sh

# Create non-root user for security
RUN addgroup -g 1001 -S validator && \
    adduser -S validator -u 1001

USER validator

# Default command
CMD ["./validate-keys.sh"]
```

```bash
#!/bin/bash
# validate-keys.sh

set -e

echo "Starting API key validation..."

# Validate all providers
PROVIDERS=("openai" "anthropic" "gemini")
RESULTS=()

for provider in "${PROVIDERS[@]}"; do
    echo "Validating $provider..."
    
    if ai-key-validator -p "$provider" --json > "${provider}-result.json"; then
        echo "✅ $provider key is valid"
        RESULTS+=("$provider:valid")
    else
        echo "❌ $provider key validation failed"
        cat "${provider}-result.json"
        RESULTS+=("$provider:invalid")
    fi
done

# Summary
echo ""
echo "Validation Summary:"
for result in "${RESULTS[@]}"; do
    echo "  $result"
done

# Exit with error if any validation failed
for result in "${RESULTS[@]}"; do
    if [[ "$result" == *":invalid"* ]]; then
        echo "One or more validations failed"
        exit 1
    fi
done

echo "All API keys are valid!"
```

### Integration with Secret Management

#### HashiCorp Vault Integration

```typescript
import { AIKeyValidator } from 'ai-key-validator';
import { VaultApi } from '@hashicorp/vault';

class VaultKeyValidator {
  private vault: VaultApi;
  private validator: AIKeyValidator;
  
  constructor(vaultConfig: any) {
    this.vault = new VaultApi(vaultConfig);
    this.validator = new AIKeyValidator();
  }
  
  async validateKeysFromVault(secretPath: string) {
    try {
      // Retrieve secrets from Vault
      const secrets = await this.vault.read(secretPath);
      const apiKeys = secrets.data;
      
      // Validate each key
      const validations = await Promise.allSettled([
        this.validateKeyIfExists(apiKeys.openai_key, 'openai'),
        this.validateKeyIfExists(apiKeys.anthropic_key, 'anthropic'),
        this.validateKeyIfExists(apiKeys.gemini_key, 'gemini')
      ]);
      
      // Process results
      const results = validations.map((result, index) => {
        const providers = ['openai', 'anthropic', 'gemini'];
        const provider = providers[index];
        
        if (result.status === 'fulfilled') {
          return { provider, ...result.value };
        } else {
          return { 
            provider, 
            valid: false, 
            error: result.reason.message 
          };
        }
      });
      
      return results;
    } catch (error) {
      throw new Error(`Failed to validate keys from Vault: ${error.message}`);
    }
  }
  
  private async validateKeyIfExists(key: string | undefined, provider: string) {
    if (!key) {
      return { valid: false, error: 'Key not found in Vault' };
    }
    
    try {
      const result = await this.validator.validate(key, provider as any);
      return { valid: result.valid, errors: result.errors };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

// Usage
async function validateVaultKeys() {
  const vaultValidator = new VaultKeyValidator({
    endpoint: 'https://vault.company.com',
    token: process.env.VAULT_TOKEN
  });
  
  const results = await vaultValidator.validateKeysFromVault('secret/ai-keys');
  
  results.forEach(result => {
    if (result.valid) {
      console.log(`✅ ${result.provider} key is valid`);
    } else {
      console.log(`❌ ${result.provider} key is invalid: ${result.error}`);
    }
  });
}
```

#### AWS Secrets Manager Integration

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { AIKeyValidator } from 'ai-key-validator';

class AWSSecretsValidator {
  private secretsManager: SecretsManagerClient;
  private validator: AIKeyValidator;
  
  constructor(region: string = 'us-east-1') {
    this.secretsManager = new SecretsManagerClient({ region });
    this.validator = new AIKeyValidator();
  }
  
  async validateKeysFromSecrets(secretName: string) {
    try {
      // Retrieve secret from AWS Secrets Manager
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.secretsManager.send(command);
      
      if (!response.SecretString) {
        throw new Error('Secret value is empty');
      }
      
      const secrets = JSON.parse(response.SecretString);
      
      // Validate API keys
      const validationPromises = Object.entries(secrets)
        .filter(([key]) => key.toLowerCase().includes('api_key'))
        .map(async ([key, value]) => {
          const provider = this.extractProviderFromKey(key);
          if (!provider) {
            return { key, provider: null, valid: false, error: 'Unknown provider' };
          }
          
          try {
            const result = await this.validator.validate(value as string, provider);
            return {
              key,
              provider,
              valid: result.valid,
              errors: result.errors,
              timing: result.timing
            };
          } catch (error) {
            return {
              key,
              provider,
              valid: false,
              error: error.message
            };
          }
        });
      
      const results = await Promise.all(validationPromises);
      return results;
      
    } catch (error) {
      throw new Error(`Failed to validate keys from AWS Secrets Manager: ${error.message}`);
    }
  }
  
  private extractProviderFromKey(key: string): string | null {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('openai')) return 'openai';
    if (keyLower.includes('anthropic') || keyLower.includes('claude')) return 'anthropic';
    if (keyLower.includes('gemini') || keyLower.includes('google')) return 'gemini';
    return null;
  }
}

// Usage
async function validateAWSSecrets() {
  const awsValidator = new AWSSecretsValidator('us-west-2');
  
  try {
    const results = await awsValidator.validateKeysFromSecrets('ai-service-keys');
    
    console.log('AWS Secrets Manager Validation Results:');
    results.forEach(result => {
      const status = result.valid ? '✅' : '❌';
      const timing = result.timing ? ` (${result.timing.total}ms)` : '';
      console.log(`${status} ${result.key} (${result.provider})${timing}`);
      
      if (!result.valid && result.errors) {
        result.errors.forEach(error => {
          console.log(`  Error: ${error.message}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Validation failed:', error.message);
  }
}
```

## TypeScript Type Definitions

Complete TypeScript definitions for all interfaces, types, and classes.

```typescript
// Core type definitions
declare module 'ai-key-validator' {
  // Provider Types
  export type ProviderType = 'openai' | 'anthropic' | 'gemini';
  
  // Validation Result Types
  export interface ValidationResult {
    valid: boolean;
    provider: ProviderType;
    status?: number;
    errors: ValidationError[];
    metadata: ValidationMetadata;
    timing?: ValidationTiming;
    cached?: boolean;
    timestamp: Date;
  }
  
  export interface ValidationError {
    code: ValidationErrorCode;
    message: string;
    suggestions?: string[];
    details?: Record<string, unknown>;
  }
  
  export interface ValidationMetadata {
    strategy: 'pattern' | 'live' | 'cached';
    endpoint?: string;
    rateLimiting?: RateLimitInfo;
    providerData?: Record<string, unknown>;
  }
  
  export interface ValidationTiming {
    total: number;
    pattern?: number;
    network?: number;
    parsing?: number;
  }
  
  // Error Types
  export enum ValidationErrorCode {
    INVALID_FORMAT = 'INVALID_FORMAT',
    INVALID_LENGTH = 'INVALID_LENGTH',
    INVALID_PREFIX = 'INVALID_PREFIX',
    INVALID_CHARACTERS = 'INVALID_CHARACTERS',
    INVALID_KEY = 'INVALID_KEY',
    ACCESS_DENIED = 'ACCESS_DENIED',
    RATE_LIMITED = 'RATE_LIMITED',
    SERVER_ERROR = 'SERVER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    DNS_RESOLUTION_FAILED = 'DNS_RESOLUTION_FAILED',
    CONNECTION_REFUSED = 'CONNECTION_REFUSED',
    PLUGIN_ERROR = 'PLUGIN_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
    SECURITY_ERROR = 'SECURITY_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  }
  
  export enum ErrorCategory {
    VALIDATION_ERROR = 'validation',
    NETWORK_ERROR = 'network',
    API_ERROR = 'api',
    SECURITY_ERROR = 'security',
    CONFIGURATION_ERROR = 'configuration',
    PLUGIN_ERROR = 'plugin',
    SYSTEM_ERROR = 'system'
  }
  
  // Configuration Types
  export interface ValidatorConfig {
    providers: ProviderConfig[];
    security: SecurityConfig;
    performance: PerformanceConfig;
    cli?: CLIConfig;
    logging?: LoggingConfig;
  }
  
  export interface ProviderConfig {
    type: ProviderType;
    enabled: boolean;
    rateLimits: RateLimitConfig;
    timeout: number;
    retries: number;
    endpoints?: Record<string, string>;
  }
  
  export interface SecurityConfig {
    auditLogging: boolean;
    memoryPoolSize: number;
    inputTimeout: number;
    maxKeyLength: number;
    verifyCleanup?: boolean;
  }
  
  export interface PerformanceConfig {
    cacheSize: number;
    cacheTTL: number;
    maxConcurrentRequests: number;
    requestTimeout: number;
    monitoring: boolean;
  }
  
  export interface CLIConfig {
    colors: boolean;
    interactiveMode: boolean;
    outputFormat: 'text' | 'json';
    verbosity: 'quiet' | 'normal' | 'verbose';
  }
  
  export interface LoggingConfig {
    level: 'error' | 'warn' | 'info' | 'debug';
    destination: 'console' | 'file';
    format: 'text' | 'json';
    filePath?: string;
  }
  
  // Rate Limiting Types
  export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    burstLimit: number;
    backoffStrategy: 'linear' | 'exponential';
  }
  
  export interface RateLimitInfo {
    remaining: number;
    resetTime: Date;
    windowSize: number;
  }
  
  // Plugin System Types
  export interface IProviderPlugin {
    readonly name: string;
    readonly type: ProviderType;
    readonly version: string;
    readonly apiVersion: string;
    
    validatePattern(key: string): PatternValidationResult;
    validateLive(key: string, options?: LiveValidationOptions): Promise<LiveValidationResult>;
    getTestRequest(key: string): ApiRequest;
    parseResponse(response: ApiResponse): ValidationResult;
    getRateLimits(): RateLimitConfig;
  }
  
  export interface PatternValidationResult {
    valid: boolean;
    format: string;
    errors: PatternError[];
  }
  
  export interface PatternError {
    code: ValidationErrorCode;
    message: string;
    suggestions?: string[];
  }
  
  export interface LiveValidationResult {
    valid: boolean;
    status: number;
    response: ApiResponse | null;
    metadata: ValidationMetadata;
  }
  
  export interface LiveValidationOptions {
    timeout?: number;
    headers?: Record<string, string>;
  }
  
  export interface ApiRequest {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    body?: unknown;
  }
  
  export interface ApiResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    url: string;
    responseTime?: number;
  }
  
  // Main API Types
  export interface ValidationOptions {
    strategy?: 'pattern' | 'live' | 'auto';
    timeout?: number;
    bypassCache?: boolean;
    headers?: Record<string, string>;
    enableTiming?: boolean;
  }
  
  export interface ValidationRequest {
    key: string;
    provider: ProviderType;
    options?: ValidationOptions;
    id?: string;
  }
  
  export interface BatchValidationOptions {
    concurrency?: number;
    continueOnError?: boolean;
    onProgress?: (completed: number, total: number) => void;
    batchTimeout?: number;
  }
  
  export interface PerformanceMetrics {
    totalValidations: number;
    averageResponseTime: number;
    successRate: number;
    cacheHitRate: number;
    errorRate: number;
    memoryUsage: number;
    providerStats: Record<ProviderType, ProviderStats>;
  }
  
  export interface ProviderStats {
    total: number;
    successful: number;
    averageTime: number;
  }
  
  export interface ProviderInfo {
    name: string;
    type: ProviderType;
    version: string;
    apiVersion: string;
    enabled: boolean;
  }
  
  // Security Types
  export interface SecurityContext {
    sessionId: string;
    securityLevel: 'standard' | 'high' | 'enterprise';
    auditConfig: AuditConfig;
    memoryConfig: MemoryConfig;
  }
  
  export interface AuditConfig {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    includeTiming: boolean;
    destination: 'console' | 'file' | 'siem';
  }
  
  export interface MemoryConfig {
    secureAllocation: boolean;
    cleanupInterval: number;
    verifyCleanup: boolean;
  }
  
  export interface SecureInputOptions {
    mask: string;
    maxLength: number;
    timeout: number;
    validate?: (input: string) => boolean;
    allowPaste: boolean;
  }
  
  // Health Check Types
  export interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthCheck[];
    timestamp: Date;
    responseTime: number;
  }
  
  export interface HealthCheck {
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    message?: string;
    responseTime?: number;
  }
  
  // Main Classes
  export class AIKeyValidator {
    constructor(config?: ValidatorConfig, securityContext?: SecurityContext);
    
    validate(key: string, provider: ProviderType, options?: ValidationOptions): Promise<ValidationResult>;
    validateBatch(requests: ValidationRequest[], options?: BatchValidationOptions): Promise<ValidationResult[]>;
    validatePattern(key: string, provider: ProviderType): PatternValidationResult;
    getProviders(): ProviderInfo[];
    registerProvider(plugin: IProviderPlugin): void;
    getPerformanceMetrics(): PerformanceMetrics;
    clearCache(): void;
    healthCheck(): Promise<HealthCheckResult>;
  }
  
  export abstract class BaseProviderPlugin implements IProviderPlugin {
    abstract readonly name: string;
    abstract readonly type: ProviderType;
    abstract readonly version: string;
    abstract readonly apiVersion: string;
    
    abstract validatePattern(key: string): PatternValidationResult;
    abstract validateLive(key: string, options?: LiveValidationOptions): Promise<LiveValidationResult>;
    abstract getTestRequest(key: string): ApiRequest;
    abstract parseResponse(response: ApiResponse): ValidationResult;
    abstract getRateLimits(): RateLimitConfig;
    
    protected makeRequest(request: ApiRequest, options?: RequestOptions): Promise<ApiResponse>;
    protected handleError(error: Error, context: string): ValidationError;
    protected createResult(
      valid: boolean,
      provider: ProviderType,
      errors?: ValidationError[],
      metadata?: Partial<ValidationMetadata>
    ): ValidationResult;
  }
  
  export class SecureString {
    constructor(value: string);
    toString(): string;
    get length(): number;
    get isDisposed(): boolean;
    dispose(): void;
    clone(): SecureString;
    equals(other: SecureString): boolean;
  }
  
  export class SecurityManager {
    constructor(config: SecurityConfig);
    secureInput(prompt: string, options: SecureInputOptions): Promise<SecureString>;
    validateInput(input: string): InputValidationResult;
    sanitizeError(error: Error): Error;
    auditLog(event: SecurityEvent): void;
    cleanup(): void;
    getSecurityMetrics(): SecurityMetrics;
  }
  
  export class ConfigManager {
    constructor(customPaths?: string[]);
    loadConfig(): Promise<ValidatorConfig>;
    loadFromFile(filePath: string): Promise<ValidatorConfig>;
    validateConfig(config: ValidatorConfig): ConfigValidationResult;
    getDefaultConfig(): ValidatorConfig;
    mergeConfigs(...configs: Partial<ValidatorConfig>[]): ValidatorConfig;
    saveConfig(config: ValidatorConfig, filePath: string, format?: 'json' | 'yaml'): Promise<void>;
  }
  
  export class PluginRegistry {
    static getInstance(): PluginRegistry;
    registerPlugin(plugin: IProviderPlugin): void;
    getPlugin(type: ProviderType): IProviderPlugin;
    listPlugins(): ProviderInfo[];
    hasProvider(type: ProviderType): boolean;
    unregisterPlugin(type: ProviderType): void;
    validatePlugin(plugin: IProviderPlugin): PluginValidationResult;
  }
  
  // Error Classes
  export class ValidationError extends Error {
    readonly code: ValidationErrorCode;
    readonly category: ErrorCategory;
    readonly recoverable: boolean;
    readonly suggestions: string[];
    readonly context: Record<string, unknown>;
    
    constructor(
      code: ValidationErrorCode,
      message: string,
      options?: {
        category?: ErrorCategory;
        recoverable?: boolean;
        suggestions?: string[];
        context?: Record<string, unknown>;
        cause?: Error;
      }
    );
  }
  
  export class ProviderError extends ValidationError {
    readonly provider: ProviderType;
  }
  
  export class NetworkError extends ValidationError {
    readonly url?: string;
    readonly statusCode?: number;
    readonly responseTime?: number;
  }
  
  // Additional Supporting Types
  export interface InputValidationResult {
    safe: boolean;
    issues: string[];
    sanitized: string;
  }
  
  export interface SecurityEvent {
    action: string;
    result: 'success' | 'failure' | 'error';
    provider?: ProviderType;
    timestamp: Date;
    metadata?: Record<string, unknown>;
    sessionId?: string;
  }
  
  export interface SecurityMetrics {
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentIssues: SecurityEvent[];
    memoryStats: MemoryStats;
  }
  
  export interface MemoryStats {
    activeInstances: number;
    totalAllocated: number;
    cleanupCount: number;
    lastCleanup: Date;
  }
  
  export interface ConfigValidationResult {
    valid: boolean;
    errors: ConfigError[];
    warnings: ConfigWarning[];
  }
  
  export interface ConfigError {
    path: string;
    message: string;
    value?: unknown;
  }
  
  export interface ConfigWarning {
    path: string;
    message: string;
    suggestion?: string;
  }
  
  export interface PluginValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
  }
}

// Module augmentation for custom provider types
declare module 'ai-key-validator' {
  interface ProviderTypeMap {
    openai: 'openai';
    anthropic: 'anthropic';
    gemini: 'gemini';
  }
  
  // Allow custom provider types
  type ExtendedProviderType = keyof ProviderTypeMap | string;
}
```

This comprehensive API documentation provides developers with all the information needed to:

1. **Understand the Architecture**: Clear overview of the system design and components
2. **Get Started Quickly**: Simple installation and usage examples
3. **Implement Custom Providers**: Complete plugin development guide with examples
4. **Integrate with CI/CD**: Ready-to-use workflow examples
5. **Handle Errors Properly**: Comprehensive error handling and recovery strategies
6. **Configure Securely**: Security-first configuration and best practices
7. **Extend Functionality**: Plugin system and customization options

The documentation follows TypeScript-first principles with complete type definitions, comprehensive examples, and security considerations throughout.