# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Key Validator is a secure npm package for validating API keys from major AI providers (OpenAI, Claude, Gemini). It provides both CLI tools and a programmatic API with memory-only operations and comprehensive testing.

**Current Status**: Documentation complete, ready for implementation. Uses documentation-first development approach with TDD.

## Development Commands

### Build & Development
```bash
npm run build           # Compile TypeScript to dist/
npm run dev             # Watch mode compilation
npm run clean           # Remove dist/ directory
```

### Testing
```bash
npm run test            # Run all tests
npm run test:watch      # Watch mode testing
npm run test:coverage   # Generate coverage report (requires 80% minimum)
```

### Code Quality
```bash
npm run lint            # ESLint validation
npm run lint:fix        # Auto-fix ESLint issues
npm run format          # Format with Prettier
npm run format:check    # Check Prettier formatting
```

### CLI Testing
```bash
# Test CLI (when implemented)
npx ai-key-validator -p openai -k sk-proj-...
npx ai-key-validator interactive
./dist/cli.js --help
```

## Architecture

### Project Structure
```
src/
├── index.ts           # Main library exports
├── cli.ts            # CLI entry point
├── types/            # TypeScript type definitions
├── core/             # Core validation engine
│   ├── validator.ts  # Main AIKeyValidator class
│   └── errors.ts     # Error classes
└── [planned directories for future implementation]
    ├── providers/    # Provider plugins (OpenAI, Claude, Gemini)
    ├── security/     # Security manager
    └── utils/        # Shared utilities

tests/
├── setup.ts          # Jest test setup
├── unit/            # Unit tests by component
├── integration/     # Integration tests
└── e2e/            # End-to-end tests
```

### Core Components

1. **AIKeyValidator** (`src/core/validator.ts`): Main validation orchestrator
2. **Provider Plugins** (planned): Extensible plugin system for AI providers
3. **CLI Interface** (`src/cli.ts`): Commander.js-based CLI with interactive/headless modes
4. **Type System** (`src/types/index.ts`): Comprehensive TypeScript interfaces

### Configuration System

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Path Mapping**: `@/*` aliases configured for clean imports
- **ESLint**: Strict rules with TypeScript support and security rules
- **Prettier**: Consistent formatting (printWidth: 100, double quotes)
- **Jest**: Comprehensive testing with coverage thresholds:
  - Global: 80% minimum
  - Security components: 90% minimum
  - Core validation: 85% minimum

### Security Architecture

- **Memory-only operations**: No persistent storage of API keys
- **Input validation**: Strict character allowlists and pattern validation
- **Secure string handling**: Memory scrubbing after operations
- **Error sanitization**: No sensitive data in error messages

## Development Guidelines

### Code Patterns

1. **Provider Plugin Pattern**: All AI providers implement `IProviderPlugin` interface
2. **Result Objects**: Consistent `ValidationResult` structure across all operations
3. **Error Handling**: Custom error classes with user-friendly messages and retry guidance
4. **Configuration**: Layered config system with defaults, file-based, and runtime overrides

### Testing Approach

- **TDD**: Tests written before implementation
- **Coverage**: Minimum 80% global, higher for critical components
- **Test Categories**: Unit, integration, and E2E tests organized by component
- **Security Testing**: Dedicated security test suite for sensitive operations

### TypeScript Usage

- **Strict Mode**: All strict options enabled
- **No Any**: Explicit `any` types forbidden in main code
- **Return Types**: Explicit return types required for public methods
- **Path Mapping**: Use `@/` aliases for clean imports

### Dependencies

- **Runtime**: axios, chalk, commander, inquirer, ora, zod
- **Dev**: TypeScript, Jest, ESLint, Prettier, Husky
- **Node Version**: 18+ required

## Implementation Notes

- Project follows security-first design principles
- Memory operations only - no file system writes for API keys
- Plugin architecture allows easy extension for new AI providers
- CLI supports both interactive prompts and headless automation
- Comprehensive documentation available in `docs/` directory
- Git hooks configured via Husky for quality gates