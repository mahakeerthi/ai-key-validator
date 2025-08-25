/**
 * Integration tests for OpenAI live API validation
 * 
 * Tests the live validation functionality against OpenAI API endpoints.
 * Following TDD approach - tests written before implementation.
 */

import { AIKeyValidator } from "../../src/core/validator";
import { ValidationResult } from "../../src/types";

// Mock axios to avoid real API calls during testing
jest.mock("axios");
import axios from "axios";
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("OpenAI Live API Validation", () => {
  let validator: AIKeyValidator;
  
  beforeEach(() => {
    validator = new AIKeyValidator();
    jest.clearAllMocks();
    // Reset axios mock
    mockedAxios.get.mockReset();
  });

  describe("Valid API Key Scenarios", () => {
    it("should return valid=true and status=200 for a valid OpenAI key", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          object: "list",
          data: [
            { id: "gpt-3.5-turbo", object: "model" },
            { id: "gpt-4", object: "model" }
          ]
        },
        headers: {}
      });

      // Act
      const result = await validator.validateLive("openai", validKey);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(result.provider).toBe("openai");
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.openai.com/v1/models",
        expect.objectContaining({
          headers: {
            "Authorization": `Bearer ${validKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        })
      );
    });

    it("should include models count in metadata for successful validation", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: {
          object: "list",
          data: [
            { id: "gpt-3.5-turbo", object: "model" },
            { id: "gpt-4", object: "model" },
            { id: "gpt-4-turbo", object: "model" }
          ]
        },
        headers: {}
      });

      // Act
      const result = await validator.validateLive("openai", validKey);

      // Assert
      expect(result.metadata?.models).toBe(3);
    });
  });

  describe("Invalid API Key Scenarios", () => {
    it("should return valid=false and status=401 for an invalid OpenAI key", async () => {
      // Arrange
      const invalidKey = "sk-invalid-key";
      
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            error: {
              message: "Incorrect API key provided",
              type: "invalid_request_error",
              code: "invalid_api_key"
            }
          }
        }
      });

      // Act
      const result = await validator.validateLive("openai", invalidKey);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.provider).toBe("openai");
      expect(result.error?.code).toBe("invalid_api_key");
      expect(result.error?.retryable).toBe(false);
    });
  });

  describe("Rate Limiting Scenarios", () => {
    it("should return status=429 and appropriate message for rate-limited key", async () => {
      // Arrange
      const rateLimitedKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: {
            error: {
              message: "Rate limit reached for requests",
              type: "requests",
              code: "rate_limit_exceeded"
            }
          },
          headers: {
            "x-ratelimit-remaining-requests": "0",
            "x-ratelimit-reset-requests": "2024-08-25T14:00:00Z"
          }
        }
      });

      // Act
      const result = await validator.validateLive("openai", rateLimitedKey);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(429);
      expect(result.message).toContain("Rate limit");
      expect(result.error?.code).toBe("rate_limit_exceeded");
      expect(result.error?.retryable).toBe(true);
      expect(result.metadata?.rateLimit).toBeDefined();
    });
  });

  describe("Network and Timeout Scenarios", () => {
    it("should handle network timeout gracefully after 30 seconds", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockRejectedValueOnce({
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded"
      });

      // Act
      const result = await validator.validateLive("openai", validKey);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(408);
      expect(result.message).toContain("timeout");
      expect(result.error?.code).toBe("TIMEOUT_ERROR");
      expect(result.error?.retryable).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(30000);
    });

    it("should handle network connection errors gracefully", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockRejectedValueOnce({
        code: "ECONNREFUSED",
        message: "connect ECONNREFUSED"
      });

      // Act
      const result = await validator.validateLive("openai", validKey);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(503);
      expect(result.message).toContain("network");
      expect(result.error?.code).toBe("NETWORK_ERROR");
      expect(result.error?.retryable).toBe(true);
    });
  });

  describe("Server Error Scenarios", () => {
    it("should return status=500 with error details for API server errors", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            error: {
              message: "The server had an error while processing your request",
              type: "server_error",
              code: "internal_server_error"
            }
          }
        }
      });

      // Act
      const result = await validator.validateLive("openai", validKey);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(500);
      expect(result.error?.code).toBe("internal_server_error");
      expect(result.error?.retryable).toBe(true);
      expect(result.message).toContain("server error");
    });
  });

  describe("Response Time Tracking", () => {
    it("should include accurate response time in metadata for all validation requests", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      const mockDelay = 150; // milliseconds
      
      mockedAxios.get.mockImplementationOnce(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              status: 200,
              data: {
                object: "list",
                data: [{ id: "gpt-3.5-turbo", object: "model" }]
              },
              headers: {}
            });
          }, mockDelay);
        });
      });

      // Act
      const startTime = Date.now();
      const result = await validator.validateLive("openai", validKey);
      const endTime = Date.now();

      // Assert
      expect(result.responseTime).toBeGreaterThanOrEqual(mockDelay);
      expect(result.responseTime).toBeLessThanOrEqual(endTime - startTime + 50); // 50ms tolerance
    });
  });

  describe("Input Validation", () => {
    it("should reject empty API key", async () => {
      // Act
      const result = await validator.validateLive("openai", "");

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error?.code).toBe("INVALID_INPUT");
    });

    it("should reject null or undefined API key", async () => {
      // Act
      const result1 = await validator.validateLive("openai", null as any);
      const result2 = await validator.validateLive("openai", undefined as any);

      // Assert
      expect(result1.valid).toBe(false);
      expect(result1.statusCode).toBe(400);
      expect(result2.valid).toBe(false);
      expect(result2.statusCode).toBe(400);
    });

    it("should validate OpenAI key pattern before making API call", async () => {
      // Arrange
      const malformedKey = "invalid-key-format";

      // Act
      const result = await validator.validateLive("openai", malformedKey);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(400);
      expect(result.error?.code).toBe("INVALID_KEY_FORMAT");
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });
  });

  describe("Security Requirements", () => {
    it("should not log API keys in any form", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { object: "list", data: [] },
        headers: {}
      });

      // Act
      await validator.validateLive("openai", validKey);

      // Assert
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining(validKey));
      
      consoleSpy.mockRestore();
    });

    it("should not include API key in error messages", async () => {
      // Arrange
      const validKey = "sk-proj-test123456789012345678901234567890123456789012345678901234567890";
      
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            error: {
              message: "Incorrect API key provided",
              type: "invalid_request_error",
              code: "invalid_api_key"
            }
          }
        }
      });

      // Act
      const result = await validator.validateLive("openai", validKey);

      // Assert
      expect(result.message).not.toContain(validKey);
      expect(result.error?.message).not.toContain(validKey);
      expect(result.error?.details).not.toContain(validKey);
    });
  });
});