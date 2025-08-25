/**
 * Integration tests for AIKeyValidator pattern validation
 * 
 * Tests the integration of Gemini pattern validation through the main validator class.
 */

import { AIKeyValidator } from "../../src/core/validator";
import { PatternValidationResult } from "../../src/types";

describe("AIKeyValidator Pattern Validation Integration", () => {
  let validator: AIKeyValidator;

  beforeEach(() => {
    validator = new AIKeyValidator();
  });

  describe("Gemini Pattern Validation Integration", () => {
    it("should validate valid Gemini key through main validator", () => {
      const apiKey = "AIza" + "ValidKey123456789012345678901234567";
      const result = validator.validatePattern("gemini", apiKey);
      
      expect(result.valid).toBe(true);
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Valid Gemini API key format");
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should reject invalid Gemini key through main validator", () => {
      const apiKey = "invalid-gemini-key";
      const result = validator.validatePattern("gemini", apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.provider).toBe("gemini");
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should handle format errors for Gemini keys", () => {
      const apiKey = "BIZA" + "x".repeat(35); // Wrong prefix
      const result = validator.validatePattern("gemini", apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.provider).toBe("gemini");
      expect(result.errorCode).toBe("INVALID_FORMAT");
    });
  });

  describe("Provider Support", () => {
    it("should reject unsupported provider", () => {
      const apiKey = "test-key";
      const result = validator.validatePattern("unsupported" as any, apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.message).toContain("Unsupported provider");
    });

    it("should handle OpenAI provider gracefully (not implemented)", () => {
      const apiKey = "sk-test-key";
      const result = validator.validatePattern("openai", apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.provider).toBe("openai");
      expect(result.message).toContain("not yet implemented");
    });

    it("should handle Claude provider gracefully (not implemented)", () => {
      const apiKey = "sk-ant-test-key";
      const result = validator.validatePattern("claude", apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.provider).toBe("claude");
      expect(result.message).toContain("not yet implemented");
    });
  });

  describe("Performance Requirements", () => {
    it("should complete pattern validation in under 100ms", () => {
      const apiKey = "AIza" + "PerformanceTestKey123456789012345";
      const startTime = Date.now();
      
      const result = validator.validatePattern("gemini", apiKey);
      
      const endTime = Date.now();
      const actualTime = endTime - startTime;
      
      expect(result.validationTime).toBeLessThan(100);
      expect(actualTime).toBeLessThan(100);
    });
  });
});