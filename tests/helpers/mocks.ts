/**
 * Test Mock Utilities
 * 
 * Provides mock implementations for testing purposes.
 */

import { IProviderPlugin, ValidationResult } from '@/providers';

export class MockProvider implements IProviderPlugin {
  constructor(
    public readonly name: string,
    public readonly supportedKeyFormats: string[] = ['mock-*']
  ) {}

  validateFormat(apiKey: string): boolean {
    return apiKey.startsWith('mock-');
  }

  async validateConnection(apiKey: string): Promise<ValidationResult> {
    return {
      isValid: apiKey === 'mock-valid-key',
      provider: this.name,
      keyFormat: 'mock-*',
      error: apiKey === 'mock-valid-key' ? undefined : 'Mock validation failed'
    };
  }
}

export const createMockHttpResponse = (status: number, data: unknown) => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  data,
  headers: {},
  config: {}
});

export const mockApiKey = {
  valid: 'mock-valid-key',
  invalid: 'mock-invalid-key',
  openai: 'sk-proj-test123456789',
  claude: 'sk-ant-test123456789',
  gemini: 'AIzatest123456789'
};