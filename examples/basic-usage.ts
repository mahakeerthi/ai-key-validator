/**
 * Basic Usage Example
 * 
 * Demonstrates basic API key validation functionality.
 */

import { AIKeyValidator } from '../src';

async function basicUsageExample(): Promise<void> {
  const validator = new AIKeyValidator();

  // Example: Validate an OpenAI API key
  try {
    const result = await validator.validate('sk-proj-example123456789', {
      provider: 'openai'
    });
    
    console.log('Validation result:', result);
  } catch (error) {
    console.error('Validation failed:', error);
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample();
}