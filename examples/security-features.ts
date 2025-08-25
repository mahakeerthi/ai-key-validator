/**
 * Security Features Example
 * 
 * Demonstrates security features like memory management and error sanitization.
 */

import { 
  SecureMemoryManager, 
  ErrorSanitizer, 
  InputValidator, 
  CryptoUtils 
} from '../src';

async function securityFeaturesExample(): Promise<void> {
  // Example 1: Secure string handling
  console.log('=== Secure Memory Management ===');
  const memoryManager = SecureMemoryManager.getInstance();
  const secureKey = memoryManager.createSecureString('sk-proj-sensitive123456789');
  
  console.log('Secure string created (value hidden)');
  secureKey.destroy(); // Scrub from memory
  console.log('Secure string destroyed');
  
  // Example 2: Input validation
  console.log('\n=== Input Validation ===');
  const validationResults = [
    InputValidator.validateApiKey('sk-proj-valid123'),
    InputValidator.validateApiKey(''), // Invalid: empty
    InputValidator.validateApiKey('sk-proj-' + 'x'.repeat(500)) // Invalid: too long
  ];
  
  validationResults.forEach((result, index) => {
    console.log(`Validation ${index + 1}:`, result);
  });
  
  // Example 3: Error sanitization
  console.log('\n=== Error Sanitization ===');
  const sensitiveError = new Error('Failed to authenticate with key sk-proj-secret123456789');
  const sanitizedMessage = ErrorSanitizer.sanitize(sensitiveError);
  console.log('Original error:', sensitiveError.message);
  console.log('Sanitized error:', sanitizedMessage);
  
  // Example 4: Crypto utilities
  console.log('\n=== Cryptographic Utilities ===');
  const dataToMask = 'sk-proj-example123456789';
  const maskedData = CryptoUtils.maskSensitiveData(dataToMask);
  console.log('Original data:', dataToMask);
  console.log('Masked data:', maskedData);
  
  const secureHash = CryptoUtils.createSecureHash('sensitive-data');
  console.log('Secure hash:', secureHash);
}

// Run the example
if (require.main === module) {
  securityFeaturesExample();
}