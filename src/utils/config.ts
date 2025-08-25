/**
 * Configuration Management
 * 
 * Handles layered configuration from defaults, files, and runtime options.
 */

export interface AIKeyValidatorConfig {
  timeout: number;
  maxRetries: number;
  logLevel: string;
  providers: {
    openai: ProviderConfig;
    claude: ProviderConfig;
    gemini: ProviderConfig;
  };
}

export interface ProviderConfig {
  enabled: boolean;
  timeout: number;
  endpoint?: string;
  headers?: Record<string, string>;
}

export class ConfigManager {
  private static config: AIKeyValidatorConfig = {
    timeout: 10000,
    maxRetries: 3,
    logLevel: 'info',
    providers: {
      openai: {
        enabled: true,
        timeout: 10000,
        endpoint: 'https://api.openai.com/v1/models'
      },
      claude: {
        enabled: true,
        timeout: 10000,
        endpoint: 'https://api.anthropic.com/v1/messages'
      },
      gemini: {
        enabled: true,
        timeout: 10000,
        endpoint: 'https://generativelanguage.googleapis.com/v1/models'
      }
    }
  };

  static getConfig(): AIKeyValidatorConfig {
    return { ...this.config };
  }

  static updateConfig(updates: Partial<AIKeyValidatorConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  static getProviderConfig(provider: string): ProviderConfig | undefined {
    return this.config.providers[provider as keyof typeof this.config.providers];
  }
}