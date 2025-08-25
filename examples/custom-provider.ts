/**
 * Custom Provider Example
 * 
 * Demonstrates how to create and register a custom provider plugin.
 */

import { IProviderPlugin, ValidationResult, ProviderRegistry } from '../src';

// Example: Custom provider for a hypothetical AI service
class CustomAIProvider implements IProviderPlugin {
  readonly name = 'custom-ai';
  readonly supportedKeyFormats = ['cai-*'];

  validateFormat(apiKey: string): boolean {
    return apiKey.startsWith('cai-') && apiKey.length >= 20;
  }

  async validateConnection(apiKey: string): Promise<ValidationResult> {
    // In a real implementation, this would make an HTTP request
    // to validate the key with the provider's API
    
    return {
      isValid: this.validateFormat(apiKey),
      provider: this.name,
      keyFormat: 'cai-*',
      error: this.validateFormat(apiKey) ? undefined : 'Invalid key format'
    };
  }
}

async function customProviderExample(): Promise<void> {
  // Register the custom provider
  const registry = new ProviderRegistry();
  registry.register(new CustomAIProvider());
  
  // Use the custom provider
  const customProvider = registry.get('custom-ai');
  
  if (customProvider) {
    const result = await customProvider.validateConnection('cai-example123456789');
    console.log('Custom provider validation:', result);
  }
}

// Run the example
if (require.main === module) {
  customProviderExample();
}