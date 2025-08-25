/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: "ts-jest",
  testEnvironment: "node",

  // Test file patterns
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/tests/**/*.test.ts",
    "**/tests/**/*.spec.ts",
  ],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],

  // Module resolution
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/types$": "<rootDir>/src/types",
    "^@/utils$": "<rootDir>/src/utils",
    "^@/providers$": "<rootDir>/src/providers",
    "^@/core$": "<rootDir>/src/core", 
    "^@/security$": "<rootDir>/src/security",
    "^@/cli$": "<rootDir>/src/cli",
  },

  // Coverage configuration
  collectCoverage: false, // Enable with --coverage flag
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/types/**/*",
  ],

  // Coverage thresholds (80% minimum as per requirements)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Higher thresholds for security-critical components
    "src/security/": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Higher thresholds for core validation logic
    "src/core/": {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },

  // Coverage reporters
  coverageReporters: ["text", "lcov", "html", "json-summary"],

  // Test timeout (in milliseconds)
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Verbose output for better debugging
  verbose: true,

  // Transform configuration for TypeScript
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: false,
        tsconfig: {
          compilerOptions: {
            module: "CommonJS",
            target: "ES2022",
          },
        },
      },
    ],
  },

  // Files to ignore
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/coverage/",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "js", "json"],

  // Error handling
  errorOnDeprecated: true,
  
  // Performance monitoring
  detectLeaks: true,
  detectOpenHandles: true,

  // Reporters for CI/CD
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "junit.xml",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
        ancestorSeparator: " › ",
        usePathForSuiteName: true,
      },
    ],
  ],
};