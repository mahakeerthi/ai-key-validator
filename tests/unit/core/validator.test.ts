/**
 * Unit tests for AIKeyValidator core functionality
 * 
 * Tests the main validator class integration with Anthropic provider.
 */

import { AIKeyValidator } from "../../../src/core/validator";
import { PatternValidationResult } from "../../../src/types";

describe("AIKeyValidator Core", () => {
  let validator: AIKeyValidator;

  beforeEach(() => {
    validator = new AIKeyValidator();
  });

  describe("Pattern Validation Integration", () => {
    it("should validate Anthropic keys through main validator", () => {
      const validKey = "sk-ant-" + "A".repeat(95);
      const result = validator.validatePattern("claude", validKey);
      
      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
      expect(result.message).toBe("API key format is valid");
      expect(result.validationTime).toBeDefined();
      expect(typeof result.validationTime).toBe("number");
    });

    it("should return error for invalid Anthropic keys", () => {
      const invalidKey = "sk-openai-" + "A".repeat(95);
      const result = validator.validatePattern("claude", invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toContain("sk-ant-");
    });

    it("should handle unsupported providers", () => {
      const testKey = "any-key";
      const result = validator.validatePattern("unsupported" as any, testKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toContain("Unsupported provider");
    });

    it("should handle missing inputs", () => {
      const result1 = validator.validatePattern("claude", "");
      const result2 = validator.validatePattern("" as any, "test");
      
      expect(result1.valid).toBe(false);
      expect(result2.valid).toBe(false);
      
      expect(result1.message).toContain("required");
      expect(result2.message).toContain("required");
    });

    it("should complete validation quickly for performance requirement", () => {
      const validKey = "sk-ant-" + "A".repeat(95);
      const startTime = performance.now();
      
      const result = validator.validatePattern("claude", validKey);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100);
      expect(result.validationTime).toBeLessThan(100);
    });
  });

  describe("Validator Configuration", () => {
    it("should return configuration", () => {
      const config = validator.getConfig();
      
      expect(config).toBeDefined();
      expect(config.defaultTimeout).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(config.providers.claude).toBeDefined();
      expect(config.providers.claude.enabled).toBe(true);
    });

    it("should update configuration", () => {
      const newTimeout = 60000;
      validator.updateConfig({ defaultTimeout: newTimeout });
      
      const config = validator.getConfig();
      expect(config.defaultTimeout).toBe(newTimeout);
    });

    it("should return version", () => {
      const version = validator.getVersion();
      expect(version).toBe("0.1.0");
    });
  });
});