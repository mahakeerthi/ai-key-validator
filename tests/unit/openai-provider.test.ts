/**
 * Unit tests for OpenAI provider
 * Tests the OpenAIProvider class functionality in isolation
 */

import { OpenAIProvider } from "../../src/providers/openai";
import { ValidationResult } from "../../src/types";

describe("OpenAIProvider", () => {
  let provider: OpenAIProvider;

  beforeEach(() => {
    provider = new OpenAIProvider();
  });

  describe("Provider Information", () => {
    it("should have correct provider metadata", () => {
      expect(provider.name).toBe("openai");
      expect(provider.displayName).toBe("OpenAI");
      expect(provider.website).toBe("https://openai.com");
    });
  });

  describe("Pattern Validation", () => {
    it("should validate correct OpenAI key patterns", () => {
      // Test legacy format
      const legacyKey = "sk-" + "A".repeat(48);
      expect(provider.validatePattern(legacyKey)).toBe(true);

      // Test project key format
      const projectKey = "sk-proj-" + "A".repeat(64);
      expect(provider.validatePattern(projectKey)).toBe(true);

      // Test general format
      const generalKey = "sk-abcd1234efgh5678ijkl";
      expect(provider.validatePattern(generalKey)).toBe(true);
    });

    it("should reject invalid OpenAI key patterns", () => {
      // Wrong prefix
      expect(provider.validatePattern("api-key-123")).toBe(false);
      
      // Too short
      expect(provider.validatePattern("sk-abc")).toBe(false);
      
      // Invalid characters
      expect(provider.validatePattern("sk-abc@def#123")).toBe(false);
      
      // Empty or null
      expect(provider.validatePattern("")).toBe(false);
      expect(provider.validatePattern(null as any)).toBe(false);
      expect(provider.validatePattern(undefined as any)).toBe(false);
    });
  });

  describe("Rate Limit Configuration", () => {
    it("should provide valid rate limit configuration", () => {
      const rateLimit = provider.getRateLimit();
      
      expect(rateLimit.requestsPerMinute).toBeGreaterThan(0);
      expect(rateLimit.requestsPerHour).toBeGreaterThan(0);
      expect(rateLimit.requestsPerDay).toBeGreaterThan(0);
      expect(rateLimit.burstLimit).toBeGreaterThan(0);
      expect(rateLimit.recommendedDelay).toBeGreaterThan(0);
    });
  });

  describe("Key Format Information", () => {
    it("should provide comprehensive key format information", () => {
      const keyFormat = provider.getKeyFormat();
      
      expect(keyFormat.prefix).toEqual(["sk-", "sk-proj-"]);
      expect(keyFormat.length).toHaveProperty("min");
      expect(keyFormat.length).toHaveProperty("max");
      expect(keyFormat.charset).toContain("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
      expect(keyFormat.pattern).toBeInstanceOf(RegExp);
      expect(keyFormat.example).toMatch(/^sk-/);
      expect(keyFormat.description).toContain("OpenAI");
    });
  });
});