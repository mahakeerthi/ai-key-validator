/**
 * Provider plugin exports
 * 
 * Central exports for all AI provider plugins.
 */

export { AnthropicProvider } from "./anthropic";

// Export provider registry for easy plugin management
export const PROVIDERS = {
  claude: () => new (require("./anthropic").AnthropicProvider)(),
} as const;

export type ProviderKey = keyof typeof PROVIDERS;