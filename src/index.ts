/**
 * AI Key Validator - Main entry point
 *
 * A secure npm package for validating API keys from major AI providers
 * (OpenAI, Claude, Gemini) with memory-only operations and TDD approach.
 */

// Main validator class export
export { AIKeyValidator } from "./core/validator";

// Core interfaces and types
export type {
  IProviderPlugin,
  ValidationResult,
  ValidatorConfig,
  SecurityContext,
  ProviderType,
  ValidationOptions,
  ValidationError,
} from "./types";

// Provider exports
export * from "./providers";

// Security exports
export * from "./security";

// Utility exports
export * from "./utils";

// CLI exports
export * from "./cli";

// Error classes
export {
  AIKeyValidatorError,
  ValidationError as ValidationErrorClass,
  NetworkError,
  ConfigurationError,
} from "./core/errors";

// Version information
export const VERSION = "0.1.0";

// Default export
import { AIKeyValidator } from "./core/validator";
export default AIKeyValidator;
