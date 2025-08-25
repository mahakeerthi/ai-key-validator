/**
 * Performance tests for Gemini pattern validation
 * 
 * Ensures validation meets the <100ms requirement from US-003.
 */

import { validateGeminiPattern } from "../../src/providers/gemini-validator";

describe("Gemini Pattern Validation Performance", () => {
  const PERFORMANCE_THRESHOLD_MS = 100;
  
  describe("Single Key Performance", () => {
    it("should validate valid key in under 100ms", () => {
      const apiKey = "AIza" + "PerformanceTestValidKey12345678901";
      
      const startTime = performance.now();
      const result = validateGeminiPattern(apiKey);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(result.valid).toBe(true);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(result.validationTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it("should validate invalid key in under 100ms", () => {
      const apiKey = "invalid-key-format";
      
      const startTime = performance.now();
      const result = validateGeminiPattern(apiKey);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(result.valid).toBe(false);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(result.validationTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });

    it("should validate empty string in under 100ms", () => {
      const apiKey = "";
      
      const startTime = performance.now();
      const result = validateGeminiPattern(apiKey);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      expect(result.valid).toBe(false);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      expect(result.validationTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });
  });

  describe("Batch Performance", () => {
    it("should validate batch of keys efficiently", () => {
      const testKeys = [
        "AIza" + "ValidKey1234567890123456789012345",
        "AIza" + "AnotherValidKey123456789012345",
        "AIza" + "ThirdValidKey1234567890123456",
        "invalid-key-1",
        "invalid-key-2",
        "AIza" + "x".repeat(50), // Too long
        "", // Empty
        null as any, // Null
        "AIza", // Too short
        "BIZA" + "x".repeat(35), // Wrong prefix
      ];

      const startTime = performance.now();
      const results = testKeys.map(key => validateGeminiPattern(key));
      const endTime = performance.now();

      const totalDuration = endTime - startTime;
      const averageDuration = totalDuration / testKeys.length;

      expect(results).toHaveLength(10);
      expect(averageDuration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      
      // Verify all individual validation times are under threshold
      results.forEach((result, index) => {
        expect(result.validationTime).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
      });
    });

    it("should handle repeated validations efficiently", () => {
      const apiKey = "AIza" + "RepeatedTestKey123456789012345";
      const iterations = 1000;

      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        validateGeminiPattern(apiKey);
      }
      
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const averageDuration = totalDuration / iterations;

      expect(averageDuration).toBeLessThan(PERFORMANCE_THRESHOLD_MS);
    });
  });

  describe("Memory Performance", () => {
    it("should not leak memory during repeated validations", () => {
      const apiKey = "AIza" + "MemoryTestKey1234567890123456";
      const iterations = 10000;

      // Warm up
      for (let i = 0; i < 100; i++) {
        validateGeminiPattern(apiKey);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      // Run many iterations
      for (let i = 0; i < iterations; i++) {
        validateGeminiPattern(apiKey);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDiff = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB for 10k iterations)
      expect(memoryDiff).toBeLessThan(1024 * 1024);
    });
  });
});