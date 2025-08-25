/**
 * Test Utility Functions
 * 
 * Common utilities for testing setup and assertions.
 */

export class TestUtils {
  /**
   * Create a test timeout for async operations
   */
  static timeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate test API keys for different providers
   */
  static generateTestKey(provider: 'openai' | 'claude' | 'gemini'): string {
    const timestamp = Date.now().toString().slice(-8);
    
    switch (provider) {
      case 'openai':
        return `sk-proj-test${timestamp}`;
      case 'claude':
        return `sk-ant-test${timestamp}`;
      case 'gemini':
        return `AIzatest${timestamp}`;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Assert that an error contains expected properties
   */
  static assertErrorShape(
    error: Error, 
    expectedMessage?: string, 
    expectedName?: string
  ): void {
    expect(error).toBeInstanceOf(Error);
    
    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage);
    }
    
    if (expectedName) {
      expect(error.name).toBe(expectedName);
    }
  }

  /**
   * Create a mock environment for testing
   */
  static mockEnv(overrides: Record<string, string> = {}): void {
    const originalEnv = process.env;
    process.env = { ...originalEnv, ...overrides };
    
    // Return cleanup function
    return () => {
      process.env = originalEnv;
    };
  }
}