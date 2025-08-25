/**
 * Base Provider Plugin Interface
 * 
 * Defines the contract that all provider plugins must implement.
 */

export interface IProviderPlugin {
  readonly name: string;
  readonly supportedKeyFormats: string[];
  
  validateFormat(apiKey: string): boolean;
  validateConnection(apiKey: string): Promise<ValidationResult>;
}

export interface ValidationResult {
  isValid: boolean;
  provider: string;
  keyFormat: string;
  error?: string;
  metadata?: Record<string, unknown>;
}