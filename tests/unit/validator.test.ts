/**
 * Unit tests for AIKeyValidator
 * Tests the main validator class functionality
 */

import { AIKeyValidator } from "../../src/core/validator";
import { ProviderType } from "../../src/types";

describe("AIKeyValidator", () => {
  let validator: AIKeyValidator;

  beforeEach(() => {
    validator = new AIKeyValidator();
  });

  describe("Initialization", () => {
    it("should initialize with default configuration", () => {
      const config = validator.getConfig();
      expect(config.defaultTimeout).toBe(30000);
      expect(config.enableCache).toBe(true);
      expect(config.providers.openai.enabled).toBe(true);
    });

    it("should initialize with custom configuration", () => {
      const customValidator = new AIKeyValidator({
        defaultTimeout: 15000,
        enableCache: false
      });
      
      const config = customValidator.getConfig();
      expect(config.defaultTimeout).toBe(15000);
      expect(config.enableCache).toBe(false);
    });
  });

  describe("Provider Management", () => {
    it("should have OpenAI provider available", () => {
      const providers = validator.getAvailableProviders();
      expect(providers).toContain("openai");
    });

    it("should get OpenAI provider instance", () => {
      const openaiProvider = validator.getProvider("openai");
      expect(openaiProvider).toBeDefined();
      expect(openaiProvider!.name).toBe("openai");
    });

    it("should return undefined for unavailable providers", () => {
      const unknownProvider = validator.getProvider("unknown" as ProviderType);
      expect(unknownProvider).toBeUndefined();
    });
  });

  describe("Pattern Validation", () => {
    it("should validate OpenAI key patterns", () => {
      const validKey = "sk-proj-" + "A".repeat(64);
      const result = validator.validatePattern("openai", validKey);
      expect(result).toBe(true);
    });

    it("should reject invalid patterns", () => {
      const invalidKey = "invalid-key";
      const result = validator.validatePattern("openai", invalidKey);
      expect(result).toBe(false);
    });

    it("should handle unsupported providers", () => {
      const result = validator.validatePattern("unknown" as ProviderType, "test-key");
      expect(result).toBe(false);
    });
  });

  describe("Configuration Updates", () => {
    it("should update configuration", () => {
      validator.updateConfig({ defaultTimeout: 20000 });
      const config = validator.getConfig();
      expect(config.defaultTimeout).toBe(20000);
    });
  });

  describe("Version Information", () => {
    it("should return version", () => {
      expect(validator.getVersion()).toBe("0.1.0");
    });
  });
});