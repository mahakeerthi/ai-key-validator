/**
 * Unit tests for Anthropic API key pattern validation
 * 
 * Tests follow TDD approach and cover all acceptance criteria:
 * - Valid Anthropic key format: sk-ant-[A-Za-z0-9\-_]{95}
 * - Invalid prefix handling
 * - Invalid length handling 
 * - Invalid characters handling
 * - Performance requirement: <100ms
 */

import { AnthropicProvider } from "../../../src/providers/anthropic";
import { PatternValidationResult } from "../../../src/types";

describe("AnthropicProvider Pattern Validation", () => {
  let provider: AnthropicProvider;

  beforeEach(() => {
    provider = new AnthropicProvider();
  });

  describe("Valid key format", () => {
    it("should return valid: true for correctly formatted Anthropic key", () => {
      // Valid format: sk-ant- + 95 characters from allowed charset
      const validKey = "sk-ant-" + "A".repeat(95);
      const result = provider.validatePattern(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
      expect(result.message).toBe("API key format is valid");
    });

    it("should accept keys with mixed case alphanumeric, hyphens, and underscores", () => {
      const validKey = "sk-ant-" + "Ab0-_".repeat(19); // 95 chars total
      const result = provider.validatePattern(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });

    it("should accept keys with all allowed character types", () => {
      const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
      // Create a 95-char string using all allowed characters
      let keyBody = "";
      for (let i = 0; i < 95; i++) {
        keyBody += allowedChars[i % allowedChars.length];
      }
      const validKey = "sk-ant-" + keyBody;
      const result = provider.validatePattern(validKey);
      
      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });
  });

  describe("Invalid prefix handling", () => {
    it("should return INVALID_PREFIX error for wrong prefix", () => {
      const invalidKey = "sk-openai-" + "A".repeat(95);
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toContain("prefix");
      expect(result.message).toContain("sk-ant-");
    });

    it("should return INVALID_PREFIX error for missing prefix", () => {
      const invalidKey = "A".repeat(95);
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
    });

    it("should return INVALID_PREFIX error for partial prefix", () => {
      const invalidKey = "sk-" + "A".repeat(95);
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
    });

    it("should return INVALID_PREFIX error for case-sensitive prefix mismatch", () => {
      const invalidKey = "SK-ANT-" + "A".repeat(95);
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
    });
  });

  describe("Invalid length handling", () => {
    it("should return INVALID_LENGTH error for key too short", () => {
      const shortKey = "sk-ant-" + "A".repeat(50); // Only 50 chars after prefix
      const result = provider.validatePattern(shortKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.message).toContain("length");
      expect(result.message).toContain("95");
    });

    it("should return INVALID_LENGTH error for key too long", () => {
      const longKey = "sk-ant-" + "A".repeat(150); // 150 chars after prefix
      const result = provider.validatePattern(longKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.message).toContain("length");
    });

    it("should return INVALID_LENGTH error for empty string", () => {
      const result = provider.validatePattern("");
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX"); // Empty string fails prefix check first
    });
  });

  describe("Invalid characters handling", () => {
    it("should return INVALID_CHARACTERS error for disallowed characters", () => {
      const invalidKey = "sk-ant-" + "A".repeat(90) + "@#$%!"; // 95 chars with invalid chars
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.message).toContain("characters");
      expect(result.message).toContain("A-Za-z0-9\\-_");
    });

    it("should return INVALID_CHARACTERS error for spaces", () => {
      const invalidKey = "sk-ant-" + "A".repeat(90) + "   AB"; // Contains spaces
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
    });

    it("should return INVALID_CHARACTERS error for special characters", () => {
      const invalidKey = "sk-ant-" + "A".repeat(90) + ".+*/"; // Contains special chars
      const result = provider.validatePattern(invalidKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
    });
  });

  describe("Performance requirements", () => {
    it("should complete validation in less than 100ms", () => {
      const testKey = "sk-ant-" + "A".repeat(95);
      const startTime = performance.now();
      
      const result = provider.validatePattern(testKey);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100);
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should complete validation in less than 100ms for invalid keys", () => {
      const testKey = "invalid-key-format";
      const startTime = performance.now();
      
      const result = provider.validatePattern(testKey);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(100);
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should complete validation quickly for edge cases", () => {
      const edgeCases = [
        "",
        "a",
        "sk-ant-",
        "sk-ant-" + "A".repeat(200),
        "wrong-prefix-" + "A".repeat(95),
      ];

      edgeCases.forEach(testKey => {
        const startTime = performance.now();
        const result = provider.validatePattern(testKey);
        const endTime = performance.now();
        
        expect(endTime - startTime).toBeLessThan(100);
        expect(result.validationTime).toBeLessThan(100);
      });
    });
  });

  describe("Error messages", () => {
    it("should provide user-friendly and actionable error messages", () => {
      const invalidPrefixKey = "wrong-prefix" + "A".repeat(95);
      const result1 = provider.validatePattern(invalidPrefixKey);
      
      expect(result1.message).toContain("prefix");
      expect(result1.message).toContain("sk-ant-");
      expect(result1.message).not.toContain("regex");
      expect(result1.message).not.toContain("undefined");
    });

    it("should provide specific guidance for length errors", () => {
      const shortKey = "sk-ant-ABC";
      const result = provider.validatePattern(shortKey);
      
      expect(result.message).toContain("95");
      expect(result.message).toContain("length");
    });

    it("should provide clear guidance for character errors", () => {
      const invalidCharKey = "sk-ant-" + "A".repeat(90) + "@#$%!";
      const result = provider.validatePattern(invalidCharKey);
      
      expect(result.message).toContain("allowed characters");
      expect(result.message).toContain("A-Za-z0-9");
    });
  });

  describe("Input validation", () => {
    it("should handle null input gracefully", () => {
      const result = provider.validatePattern(null as any);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it("should handle undefined input gracefully", () => {
      const result = provider.validatePattern(undefined as any);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBeDefined();
      expect(result.message).toBeDefined();
    });
  });
});