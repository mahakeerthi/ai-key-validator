"use strict";
/**
 * Jest test setup configuration
 * This file runs before all tests and sets up global test environment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMemoryTest = exports.suppressConsole = exports.delay = exports.TEST_CONSTANTS = void 0;
// Extend Jest matchers if needed
// import "jest-extended";
// Set up test environment variables
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent"; // Suppress logs during tests
// Global test timeout (can be overridden per test)
jest.setTimeout(10000);
// Mock console methods to keep test output clean
const originalConsole = global.console;
beforeAll(() => {
    // You can mock console methods here if needed for cleaner test output
    // global.console = {
    //   ...originalConsole,
    //   log: jest.fn(),
    //   info: jest.fn(),
    //   warn: jest.fn(),
    //   error: originalConsole.error, // Keep error for debugging
    // };
});
afterAll(() => {
    // Restore original console
    global.console = originalConsole;
});
// Global test utilities
exports.TEST_CONSTANTS = {
    // Mock API keys for testing (following expected patterns)
    MOCK_API_KEYS: {
        openai: {
            valid: "sk-proj-" + "x".repeat(48),
            validLegacy: "sk-" + "x".repeat(48),
            invalid: "sk-invalid-key",
            malformed: "not-a-key",
            empty: "",
        },
        claude: {
            valid: "sk-ant-api03-" + "x".repeat(95),
            invalid: "sk-ant-invalid",
            malformed: "sk-wrong-format",
            empty: "",
        },
        gemini: {
            valid: "AIza" + "x".repeat(35),
            invalid: "AIza-invalid",
            malformed: "wrong-format",
            empty: "",
        },
    },
    // Mock HTTP responses
    MOCK_RESPONSES: {
        success: { status: 200, statusText: "OK" },
        unauthorized: { status: 401, statusText: "Unauthorized" },
        forbidden: { status: 403, statusText: "Forbidden" },
        notFound: { status: 404, statusText: "Not Found" },
        rateLimited: { status: 429, statusText: "Too Many Requests" },
        serverError: { status: 500, statusText: "Internal Server Error" },
        badGateway: { status: 502, statusText: "Bad Gateway" },
        serviceUnavailable: { status: 503, statusText: "Service Unavailable" },
    },
    // Test timeouts
    TIMEOUTS: {
        fast: 100,
        normal: 1000,
        slow: 5000,
    },
};
// Helper function to create async delays for testing
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.delay = delay;
// Helper function to suppress console output during tests
const suppressConsole = (fn) => {
    const originalMethods = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    };
    // Mock all console methods
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    try {
        return fn();
    }
    finally {
        // Restore original console methods
        Object.assign(console, originalMethods);
    }
};
exports.suppressConsole = suppressConsole;
// Memory cleanup helper for testing memory management
const createMemoryTest = () => {
    const testObjects = [];
    return {
        track: (obj) => {
            testObjects.push(obj);
            return obj;
        },
        cleanup: () => {
            testObjects.forEach((obj) => {
                Object.keys(obj).forEach((key) => {
                    delete obj[key];
                });
            });
            testObjects.length = 0;
        },
        getTrackedCount: () => testObjects.length,
    };
};
exports.createMemoryTest = createMemoryTest;
// Setup global error handling for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
// Cleanup after each test
afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
});
//# sourceMappingURL=setup.js.map