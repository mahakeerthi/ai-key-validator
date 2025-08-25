# AI Key Validator Examples

This directory contains usage examples demonstrating various features of the AI Key Validator library.

## Examples Overview

### 1. Basic Usage (`basic-usage.ts`)
Demonstrates the fundamental API key validation functionality:
- Simple validation workflow
- Error handling
- Result interpretation

### 2. CLI Usage (`cli-usage.ts`) 
Shows how to use the CLI tools:
- Command-line validation
- Interactive mode
- Programmatic CLI execution

### 3. Custom Provider (`custom-provider.ts`)
Illustrates how to extend the library with custom providers:
- Implementing the `IProviderPlugin` interface
- Registering custom providers
- Using custom validation logic

### 4. Security Features (`security-features.ts`)
Highlights security features:
- Secure memory management
- Input validation
- Error sanitization
- Cryptographic utilities

## Running Examples

Make sure the project is built first:

```bash
npm run build
```

Then run individual examples:

```bash
# Basic usage
npx ts-node examples/basic-usage.ts

# Security features
npx ts-node examples/security-features.ts

# Custom provider
npx ts-node examples/custom-provider.ts

# CLI usage (shows commands, doesn't execute)
npx ts-node examples/cli-usage.ts
```

## Integration in Your Project

These examples can serve as templates for integrating the AI Key Validator into your own projects. Copy and modify the relevant example code to suit your specific needs.