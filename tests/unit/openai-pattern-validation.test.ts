/**
 * Unit tests for OpenAI API key pattern validation
 * 
 * Tests the pattern validation functionality for OpenAI API keys
 * following the acceptance criteria and TDD approach.
 */

import { PatternValidationResult } from "@/types";

// Import the function we'll implement
import { validateOpenAIKeyPattern } from "@/core/pattern-validators";

describe("OpenAI Key Pattern Validation", () => {
  describe("Valid OpenAI keys", () => {
    test("should return valid: true for correct OpenAI key format", () => {
      // Test with valid 48-character key after sk-
      const validKey = "sk-" + "A".repeat(48);
      const result: PatternValidationResult = validateOpenAIKeyPattern(validKey);

      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
      expect(result.message).toBe("Valid OpenAI API key format");
      expect(result.provider).toBe("openai");
      expect(result.responseTime).toBeLessThan(100);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test("should accept keys with mixed case alphanumeric characters", () => {
      const validKey = "sk-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnop123456";
      const result = validateOpenAIKeyPattern(validKey);

      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });

    test("should accept keys with numbers", () => {
      const validKey = "sk-" + "1234567890".repeat(4) + "12345678";
      const result = validateOpenAIKeyPattern(validKey);

      expect(result.valid).toBe(true);
      expect(result.errorCode).toBeUndefined();
    });
  });

  describe("Invalid prefix", () => {
    test("should return INVALID_PREFIX for wrong prefix", () => {
      const invalidKey = "sk-wrong-" + "A".repeat(43);
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toBe("OpenAI API keys must start with 'sk-'");
      expect(result.provider).toBe("openai");
      expect(result.responseTime).toBeLessThan(100);
    });

    test("should return INVALID_PREFIX for missing prefix", () => {
      const invalidKey = "A".repeat(51);
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toBe("OpenAI API keys must start with 'sk-'");
    });

    test("should return INVALID_PREFIX for empty string", () => {
      const result = validateOpenAIKeyPattern("");

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toBe("OpenAI API keys must start with 'sk-'");
    });

    test("should return INVALID_PREFIX for case-sensitive prefix", () => {
      const invalidKey = "SK-" + "A".repeat(48);
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_PREFIX");
      expect(result.message).toBe("OpenAI API keys must start with 'sk-'");
    });
  });

  describe("Invalid length", () => {
    test("should return INVALID_LENGTH for key too short", () => {
      const shortKey = "sk-ABC";
      const result = validateOpenAIKeyPattern(shortKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.message).toBe("OpenAI API keys must be exactly 51 characters long (sk- + 48 characters)");
      expect(result.provider).toBe("openai");
    });

    test("should return INVALID_LENGTH for key too long", () => {
      const longKey = "sk-" + "A".repeat(50);
      const result = validateOpenAIKeyPattern(longKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.message).toBe("OpenAI API keys must be exactly 51 characters long (sk- + 48 characters)");
    });

    test("should return INVALID_LENGTH for key with correct prefix but wrong total length", () => {
      const invalidKey = "sk-" + "A".repeat(47); // One character short
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
    });
  });

  describe("Invalid characters", () => {
    test("should return INVALID_CHARACTERS for special characters", () => {
      const invalidKey = "sk-" + "A".repeat(40) + "!@#$%^&*";
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.message).toBe("OpenAI API keys can only contain alphanumeric characters (A-Z, a-z, 0-9)");
      expect(result.provider).toBe("openai");
    });

    test("should return INVALID_CHARACTERS for spaces", () => {
      const invalidKey = "sk-" + "A".repeat(40) + "        ";
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.message).toBe("OpenAI API keys can only contain alphanumeric characters (A-Z, a-z, 0-9)");
    });

    test("should return INVALID_CHARACTERS for hyphens in body", () => {
      const invalidKey = "sk-" + "A".repeat(40) + "--------";
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.message).toBe("OpenAI API keys can only contain alphanumeric characters (A-Z, a-z, 0-9)");
    });

    test("should return INVALID_CHARACTERS for underscores", () => {
      const invalidKey = "sk-" + "A".repeat(40) + "________";
      const result = validateOpenAIKeyPattern(invalidKey);

      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
      expect(result.message).toBe("OpenAI API keys can only contain alphanumeric characters (A-Z, a-z, 0-9)");
    });
  });

  describe("Performance requirements", () => {
    test("should complete validation in under 100ms", () => {
      const testKeys = [
        "sk-" + "A".repeat(48), // valid
        "sk-" + "A".repeat(47), // invalid length
        "invalid-prefix" + "A".repeat(37), // invalid prefix
        "sk-" + "A".repeat(40) + "!@#$%^&*", // invalid characters
      ];

      testKeys.forEach((key) => {
        const startTime = Date.now();
        const result = validateOpenAIKeyPattern(key);
        const endTime = Date.now();

        expect(endTime - startTime).toBeLessThan(100);
        expect(result.responseTime).toBeLessThan(100);
      });
    });

    test("should handle multiple rapid validations efficiently", () => {
      const keys = Array.from({ length: 100 }, (_, i) => 
        i % 2 === 0 
          ? "sk-" + "A".repeat(48) 
          : "sk-" + "B".repeat(47)
      );

      const startTime = Date.now();
      const results = keys.map(key => validateOpenAIKeyPattern(key));
      const endTime = Date.now();

      // All 100 validations should complete in under 1 second total
      expect(endTime - startTime).toBeLessThan(1000);
      
      // Each individual validation should be under 100ms
      results.forEach(result => {
        expect(result.responseTime).toBeLessThan(100);
      });
    });
  });

  describe("Error message clarity", () => {
    test("should provide user-friendly error messages", () => {
      const testCases = [
        {
          key: "",
          expectedMessage: "OpenAI API keys must start with 'sk-'",
        },
        {
          key: "sk-short",
          expectedMessage: "OpenAI API keys must be exactly 51 characters long (sk- + 48 characters)",
        },
        {
          key: "sk-" + "A".repeat(40) + "!@#$%^&*",
          expectedMessage: "OpenAI API keys can only contain alphanumeric characters (A-Z, a-z, 0-9)",
        },
      ];

      testCases.forEach(({ key, expectedMessage }) => {
        const result = validateOpenAIKeyPattern(key);
        expect(result.message).toBe(expectedMessage);
      });
    });
  });

  describe("Edge cases", () => {
    test("should handle null input gracefully", () => {
      // TypeScript should prevent this, but test runtime behavior
      const result = validateOpenAIKeyPattern(null as any);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBeDefined();
    });

    test("should handle undefined input gracefully", () => {
      const result = validateOpenAIKeyPattern(undefined as any);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBeDefined();
    });

    test("should handle non-string input gracefully", () => {
      const result = validateOpenAIKeyPattern(123 as any);
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBeDefined();
    });

    test("should handle extremely long strings", () => {
      const veryLongKey = "sk-" + "A".repeat(1000);
      const result = validateOpenAIKeyPattern(veryLongKey);
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe("INVALID_LENGTH");
      expect(result.responseTime).toBeLessThan(100);
    });
  });

  describe("Priority validation order", () => {
    test("should check prefix first, then length, then characters", () => {
      // Invalid prefix with invalid length and characters
      const invalidKey = "wrong-" + "A".repeat(40) + "!@#$";
      const result = validateOpenAIKeyPattern(invalidKey);
      
      expect(result.errorCode).toBe("INVALID_PREFIX");
    });

    test("should check length after valid prefix", () => {
      // Valid prefix, invalid length and characters
      const invalidKey = "sk-" + "A".repeat(30) + "!@#$";
      const result = validateOpenAIKeyPattern(invalidKey);
      
      expect(result.errorCode).toBe("INVALID_LENGTH");
    });

    test("should check characters after valid prefix and length", () => {
      // Valid prefix and length, invalid characters
      const invalidKey = "sk-" + "A".repeat(40) + "!@#$%^&*";
      const result = validateOpenAIKeyPattern(invalidKey);
      
      expect(result.errorCode).toBe("INVALID_CHARACTERS");
    });
  });
});