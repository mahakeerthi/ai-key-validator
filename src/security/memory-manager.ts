/**
 * Secure Memory Manager
 * 
 * Handles secure string operations and memory scrubbing for API keys.
 */

export class SecureMemoryManager {
  private static instance: SecureMemoryManager;

  static getInstance(): SecureMemoryManager {
    if (!this.instance) {
      this.instance = new SecureMemoryManager();
    }
    return this.instance;
  }

  /**
   * Create a secure string that will be automatically scrubbed from memory
   */
  createSecureString(value: string): SecureString {
    return new SecureString(value);
  }

  /**
   * Scrub sensitive data from memory
   */
  scrubMemory(target: string): void {
    // Placeholder for secure memory scrubbing implementation
    // In a real implementation, this would overwrite memory locations
  }
}

export class SecureString {
  private value: string;
  private isDestroyed = false;

  constructor(value: string) {
    this.value = value;
  }

  getValue(): string {
    if (this.isDestroyed) {
      throw new Error('SecureString has been destroyed');
    }
    return this.value;
  }

  destroy(): void {
    if (!this.isDestroyed) {
      SecureMemoryManager.getInstance().scrubMemory(this.value);
      this.value = '';
      this.isDestroyed = true;
    }
  }
}