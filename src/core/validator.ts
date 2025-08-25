/**
 * AI Key Validator - Core validation engine
 *
 * Main validator class that orchestrates API key validation across providers.
 */

import { ProviderType, ValidationResult, ValidatorConfig, ValidationOptions, IProviderPlugin } from "../types";
import { OpenAIProvider } from "../providers/openai";

/**
 * Core AI Key Validator class
 *
 * This is the main entry point for validating API keys.
 * It provides both pattern validation and live API validation.
 */
export class AIKeyValidator {
  private config: ValidatorConfig;
  private providers: Map<ProviderType, IProviderPlugin>;

  /**
   * Create a new AI Key Validator instance
   * @param config - Optional configuration override
   */
  constructor(config?: Partial<ValidatorConfig>) {
    // Default configuration (will be expanded in future implementations)
    this.config = {
      defaultTimeout: 30000,
      enableCache: true,
      cacheTTL: 300000, // 5 minutes
      maxConcurrency: 5,
      enableRateLimit: true,
      providers: {
        openai: { enabled: true },
        claude: { enabled: true },
        gemini: { enabled: true },
      },
      security: {
        enableMemoryScrubbing: true,
        enableAuditLogging: true,
        maxMemoryUsage: 50,
        redactSensitiveData: true,
        allowedKeyCharacters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
      },
      logging: {
        level: "info",
        console: true,
        structured: false,
      },
      ...config,
    };

    // Initialize providers
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Initialize provider plugins
   */
  private initializeProviders(): void {
    // Register OpenAI provider
    this.providers.set("openai", new OpenAIProvider());
    
    // Note: Claude and Gemini providers will be added in future implementations
  }

  /**
   * Validate an API key (main public method)
   * @param provider - The AI provider type
   * @param apiKey - The API key to validate
   * @returns Promise resolving to validation result
   */
  public validate(provider: ProviderType, apiKey: string): ValidationResult {
    const startTime = Date.now();

    try {
      // Basic input validation
      if (!provider || !apiKey) {
        throw new Error("Provider and API key are required");
      }

      if (!this.isValidProvider(provider)) {
        throw new Error(`Unsupported provider: ${String(provider)}`);
      }

      // This is a placeholder implementation
      // The actual validation logic will be implemented in subsequent tasks
      return {
        valid: true,
        statusCode: 200,
        message: "Validation not yet implemented",
        provider,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      return {
        valid: false,
        statusCode: 500,
        message: errorMessage,
        provider,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: {
          code: "VALIDATION_ERROR",
          message: errorMessage,
          retryable: false,
        },
      };
    }
  }

  /**
   * Check if a provider is supported
   * @param provider - Provider to check
   * @returns True if provider is supported
   */
  private isValidProvider(provider: string): provider is ProviderType {
    return ["openai", "claude", "gemini"].includes(provider);
  }

  /**
   * Get validator configuration
   * @returns Current configuration
   */
  public getConfig(): ValidatorConfig {
    return { ...this.config };
  }

  /**
   * Update validator configuration
   * @param config - Configuration updates
   */
  public updateConfig(config: Partial<ValidatorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Validate an API key using live API validation
   * @param provider - The AI provider type
   * @param apiKey - The API key to validate
   * @param options - Optional validation options
   * @returns Promise resolving to validation result
   */
  public async validateLive(provider: ProviderType, apiKey: string, options?: ValidationOptions): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      // Basic input validation
      if (!provider || !apiKey) {
        return {
          valid: false,
          statusCode: 400,
          message: "Provider and API key are required",
          provider: provider || "unknown" as ProviderType,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
          error: {
            code: "INVALID_INPUT",
            message: "Provider and API key are required",
            retryable: false,
            suggestion: "Provide both provider and API key parameters"
          }
        };
      }

      if (!this.isValidProvider(provider)) {
        return {
          valid: false,
          statusCode: 400,
          message: `Unsupported provider: ${String(provider)}`,
          provider: provider as ProviderType,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
          error: {
            code: "UNSUPPORTED_PROVIDER",
            message: `Provider '${String(provider)}' is not supported`,
            retryable: false,
            suggestion: "Use one of the supported providers: openai, claude, gemini"
          }
        };
      }

      // Get the provider plugin
      const providerPlugin = this.providers.get(provider);
      if (!providerPlugin) {
        return {
          valid: false,
          statusCode: 500,
          message: `Provider '${provider}' is not available`,
          provider,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
          error: {
            code: "PROVIDER_UNAVAILABLE",
            message: `Provider plugin for '${provider}' is not loaded`,
            retryable: false,
            suggestion: "Contact support if this error persists"
          }
        };
      }

      // Check if provider is enabled
      if (!this.config.providers[provider]?.enabled) {
        return {
          valid: false,
          statusCode: 403,
          message: `Provider '${provider}' is disabled`,
          provider,
          responseTime: Date.now() - startTime,
          timestamp: new Date(),
          error: {
            code: "PROVIDER_DISABLED",
            message: `Provider '${provider}' is currently disabled`,
            retryable: false,
            suggestion: "Enable the provider in configuration or contact administrator"
          }
        };
      }

      // Merge options with defaults
      const validationOptions: ValidationOptions = {
        timeout: this.config.defaultTimeout,
        useCache: this.config.enableCache,
        strict: true,
        ...options
      };

      // Perform live validation using the provider plugin
      return await providerPlugin.validateAPI(apiKey, validationOptions);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      return {
        valid: false,
        statusCode: 500,
        message: `Validation failed: ${errorMessage}`,
        provider: provider as ProviderType,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: {
          code: "VALIDATION_ERROR",
          message: errorMessage,
          retryable: false,
          suggestion: "Check your input and try again"
        }
      };
    }
  }

  /**
   * Validate API key pattern only (no network request)
   * @param provider - The AI provider type
   * @param apiKey - The API key to validate
   * @returns True if pattern is valid, false otherwise
   */
  public validatePattern(provider: ProviderType, apiKey: string): boolean {
    if (!this.isValidProvider(provider) || !apiKey) {
      return false;
    }

    const providerPlugin = this.providers.get(provider);
    if (!providerPlugin) {
      return false;
    }

    return providerPlugin.validatePattern(apiKey);
  }

  /**
   * Get provider plugin information
   * @param provider - The provider to get info for
   * @returns Provider plugin or undefined if not found
   */
  public getProvider(provider: ProviderType): IProviderPlugin | undefined {
    return this.providers.get(provider);
  }

  /**
   * Get all available providers
   * @returns Array of provider types
   */
  public getAvailableProviders(): ProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get version information
   * @returns Version string
   */
  public getVersion(): string {
    return "0.1.0";
  }
}
