/**
 * Unit tests for Gemini API key pattern validation
 * 
 * Tests the pattern validation logic for Google Gemini API keys
 * following the acceptance criteria from User Story US-003.
 */

import { validateGeminiPattern } from "../../src/providers/gemini-validator";
import { PatternValidationResult } from "../../src/types";

describe("Gemini Pattern Validation", () => {
  describe("Valid Gemini API Keys", () => {
    it("should return valid: true for correctly formatted Gemini key", () => {
      const apiKey = "AIza" + "B".repeat(35); // Standard Gemini format
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(true);
      expect(result.provider).toBe("gemini");
      expect(result.errorCode).toBeUndefined();
      expect(result.message).toBe("Valid Gemini API key format");
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should return valid: true for Gemini key with mixed case characters", () => {
      const apiKey = "AIza" + "aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789";
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(true);
      expect(result.provider).toBe("gemini");
    });

    it("should return valid: true for Gemini key with numbers and letters", () => {
      const apiKey = "AIza" + "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYa";
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(true);
      expect(result.provider).toBe("gemini");
    });

    it("should return valid: true for Gemini key with hyphens and underscores", () => {
      const apiKey = "AIza" + "Test_Key-With-Special-Chars_123456789";
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(true);
      expect(result.provider).toBe("gemini");
    });
  });

  describe("Invalid Format", () => {
    it("should return INVALID_FORMAT for incorrect prefix", () => {
      const apiKey = "BIZA" + "x".repeat(35); // Wrong prefix
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Invalid Gemini API key format. Expected format: AIza[35 characters]");
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should return INVALID_FORMAT for missing prefix", () => {
      const apiKey = "x".repeat(39); // No AIza prefix
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.provider).toBe("gemini");
    });

    it("should return INVALID_FORMAT for partial prefix", () => {
      const apiKey = "AI" + "x".repeat(37); // Incomplete prefix
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.provider).toBe("gemini");
    });

    it("should return INVALID_FORMAT for case-sensitive prefix", () => {
      const apiKey = "aiza" + "x".repeat(35); // Lowercase prefix
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.provider).toBe("gemini");
    });
  });

  describe("Invalid Length", () => {
    it("should return INVALID_LENGTH for key too short", () => {
      const apiKey = "AIza" + "x".repeat(20); // 24 characters total, too short
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Invalid Gemini API key length. Expected 39 characters, got 24");
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should return INVALID_LENGTH for key too long", () => {
      const apiKey = "AIza" + "x".repeat(50); // 54 characters total, too long
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Invalid Gemini API key length. Expected 39 characters, got 54");
    });

    it("should return INVALID_LENGTH for empty string", () => {
      const apiKey = "";
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Invalid Gemini API key length. Expected 39 characters, got 0");
    });

    it("should return INVALID_LENGTH for just the prefix", () => {
      const apiKey = "AIza"; // Only prefix, 4 characters
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Invalid Gemini API key length. Expected 39 characters, got 4");
    });
  });

  describe("Invalid Characters", () => {
    it("should return INVALID_CHARACTERS for keys with spaces", () => {
      const apiKey = "AIza" + "xxxx xxxx ".repeat(3) + "xxxxx"; // Contains spaces
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.provider).toBe("gemini");
      expect(result.message).toBe("Invalid characters in Gemini API key. Only alphanumeric characters, hyphens, and underscores are allowed");
      expect(result.validationTime).toBeLessThan(100);
    });

    it("should return INVALID_CHARACTERS for keys with special symbols", () => {
      const apiKey = "AIza" + "x".repeat(30) + "$%^&*"; // Contains special symbols
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.provider).toBe("gemini");
    });

    it("should return INVALID_CHARACTERS for keys with newlines", () => {
      const apiKey = "AIza" + "x".repeat(30) + "test\nkey"; // Contains newline
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.provider).toBe("gemini");
    });

    it("should return INVALID_CHARACTERS for keys with unicode characters", () => {
      const apiKey = "AIza" + "x".repeat(30) + "tést€"; // Contains unicode
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.provider).toBe("gemini");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null input gracefully", () => {
      const result = validateGeminiPattern(null as any);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.message).toBe("Invalid input: API key cannot be null or undefined");
    });

    it("should handle undefined input gracefully", () => {
      const result = validateGeminiPattern(undefined as any);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_FORMAT");
      expect(result.message).toBe("Invalid input: API key cannot be null or undefined");
    });

    it("should trim whitespace and validate", () => {
      const apiKey = "  AIza" + "x".repeat(35) + "  "; // Leading/trailing spaces
      const result = validateGeminiPattern(apiKey);
      
      expect(result.valid).toBe(true);
      expect(result.provider).toBe("gemini");
    });
  });

  describe("Performance Requirements", () => {
    it("should complete validation in under 100ms", () => {
      const apiKey = "AIza" + "x".repeat(35);
      const startTime = Date.now();
      
      const result = validateGeminiPattern(apiKey);
      
      const endTime = Date.now();
      const actualTime = endTime - startTime;
      
      expect(result.validationTime).toBeLessThan(100);
      expect(actualTime).toBeLessThan(100);
    });

    it("should complete validation in under 100ms for invalid keys", () => {
      const apiKey = "invalid-key";
      const startTime = Date.now();
      
      const result = validateGeminiPattern(apiKey);
      
      const endTime = Date.now();
      const actualTime = endTime - startTime;
      
      expect(result.validationTime).toBeLessThan(100);
      expect(actualTime).toBeLessThan(100);
    });

    it("should complete batch validations efficiently", () => {
      const testKeys = [
        "AIza" + "x".repeat(35),
        "AIza" + "y".repeat(35), 
        "invalid-key",
        "",
        "AIza" + "z".repeat(50)
      ];
      
      const startTime = Date.now();
      
      const results = testKeys.map(key => validateGeminiPattern(key));
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / testKeys.length;
      
      expect(avgTime).toBeLessThan(100);
      expect(results).toHaveLength(5);
    });
  });
});