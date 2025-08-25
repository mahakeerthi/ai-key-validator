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
  PatternValidationResult,
  ValidatorConfig,
  SecurityContext,
  ProviderType,
  ValidationOptions,
  ValidationError,
} from "./types";

// Provider exports (will be implemented in future tasks)
// export { OpenAIProvider } from "./providers/openai-provider";
// export { ClaudeProvider } from "./providers/claude-provider";
// export { GeminiProvider } from "./providers/gemini-provider";
// export { BaseProvider } from "./providers/base-provider";

// Pattern validators
export { validateOpenAIKeyPattern } from "./core/pattern-validators";

// Core utilities (will be implemented in future tasks)
// export { PluginManager } from "./core/plugin-manager";
// export { SecurityManager } from "./security/security-manager";
// export { ConfigManager } from "./core/config-manager";

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
