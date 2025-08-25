/**
 * Integration tests for AI Key Validator with pattern validation
 */

import { AIKeyValidator } from "@/core/validator";
import { PatternValidationResult } from "@/types";

describe("AIKeyValidator Pattern Validation Integration", () => {
  let validator: AIKeyValidator;

  beforeEach(() => {
    validator = new AIKeyValidator();
  });

  describe("OpenAI pattern validation", () => {
    test("should validate correct OpenAI key pattern", () => {
      const validKey = "sk-" + "A".repeat(48);
      const result: PatternValidationResult = validator.validatePattern("openai", validKey);

      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
      expect(result.message).toBe("Valid OpenAI API key format");
      expect(result.provider).toBe("openai");
      expect(result.responseTime).toBeLessThan(100);
    });

    test("should reject invalid OpenAI key pattern", () => {
      const invalidKey = "sk-" + "A".repeat(47); // Too short
      const result = validator.validatePattern("openai", invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.provider).toBe("openai");
    });
  });

  describe("Provider validation", () => {
    test("should handle unsupported provider gracefully", () => {
      const result = validator.validatePattern("unsupported" as any, "any-key");

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toContain("Unsupported provider");
    });

    test("should throw error for unimplemented providers", () => {
      expect(() => {
        validator.validatePattern("claude", "sk-ant-api03-" + "x".repeat(95));
      }).toThrow("Claude pattern validation not yet implemented");

      expect(() => {
        validator.validatePattern("gemini", "AIza" + "x".repeat(35));
      }).toThrow("Gemini pattern validation not yet implemented");
    });
  });

  describe("Performance requirements", () => {
    test("should complete pattern validation within performance requirements", () => {
      const testCases = [
        "sk-" + "A".repeat(48), // valid
        "sk-" + "A".repeat(47), // invalid length
        "invalid-key", // invalid prefix
        "sk-" + "A".repeat(40) + "!@#$%^&*", // invalid characters
      ];

      testCases.forEach((key) => {
        const startTime = Date.now();
        const result = validator.validatePattern("openai", key);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(100);
        expect(result.responseTime).toBeLessThan(100);
      });
    });
  });
});