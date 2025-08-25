#!/usr/bin/env node

/**
 * AI Key Validator - CLI Entry Point
 *
 * Command-line interface for validating AI provider API keys.
 * Supports both interactive and headless modes.
 */

import { Command } from "commander";
import chalk from "chalk";
// import { AIKeyValidator } from "./core/validator";
import { VERSION } from "./index";

// CLI program setup
const program = new Command();

program
  .name("ai-key-validator")
  .description("Validate API keys from major AI providers (OpenAI, Claude, Gemini)")
  .version(VERSION, "-v, --version", "display version number");

// Headless mode command
program
  .option("-p, --provider <provider>", "AI provider (openai, claude, gemini)")
  .option("-k, --api-key <key>", "API key to validate")
  .option("-f, --format <format>", "output format (json, human)", "human")
  .option("-t, --timeout <seconds>", "request timeout in seconds", "30")
  .option("-q, --quiet", "suppress output except errors")
  .option("-v, --verbose", "verbose output")
  .action(async (options) => {
    try {
      // If no provider or key specified, run interactive mode
      if (!options.provider || !options.apiKey) {
        console.log(chalk.cyan("🤖 AI Key Validator"));
        console.log(chalk.gray("Starting interactive mode..."));
        console.log(chalk.yellow("Interactive mode not yet implemented. Use --help for usage."));
        return;
      }

      // Headless mode validation
      if (!options.quiet) {
        console.log(chalk.cyan(`Validating ${options.provider} API key...`));
      }

      // This will be implemented when we create the validator
      console.log(chalk.yellow("Validation logic not yet implemented."));
      console.log(chalk.green(`✓ Setup complete! Provider: ${options.provider}`));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      if (options.format === "json") {
        console.log(
          JSON.stringify({
            success: false,
            error: errorMessage,
          })
        );
      } else {
        console.error(chalk.red(`✗ Error: ${errorMessage}`));
      }
      process.exit(1);
    }
  });

// Interactive mode command
program
  .command("interactive")
  .alias("i")
  .description("run in interactive mode")
  .action(async () => {
    console.log(chalk.cyan("🤖 AI Key Validator - Interactive Mode"));
    console.log(chalk.yellow("Interactive mode not yet implemented."));
  });

// Batch validation command
program
  .command("batch <file>")
  .description("validate multiple API keys from a file")
  .option("-f, --format <format>", "output format (json, human)", "human")
  .action(async (file) => {
    console.log(chalk.cyan(`Batch validation from file: ${file}`));
    console.log(chalk.yellow("Batch mode not yet implemented."));
  });

// Help examples
program.on("--help", () => {
  console.log("");
  console.log(chalk.bold("Examples:"));
  console.log(`  ${chalk.gray("$")} ai-key-validator -p openai -k sk-proj-...`);
  console.log(`  ${chalk.gray("$")} ai-key-validator -p claude -k sk-ant-...`);
  console.log(`  ${chalk.gray("$")} ai-key-validator -p gemini -k AIza...`);
  console.log(`  ${chalk.gray("$")} ai-key-validator interactive`);
  console.log(`  ${chalk.gray("$")} ai-key-validator batch keys.txt`);
  console.log("");
  console.log(chalk.bold("Supported Providers:"));
  console.log(`  ${chalk.green("openai")}  - OpenAI (GPT, DALL-E)`);
  console.log(`  ${chalk.red("claude")}   - Anthropic Claude`);
  console.log(`  ${chalk.blue("gemini")}  - Google Gemini`);
});

// Parse command line arguments
if (process.argv.length === 2) {
  // No arguments provided, show help
  program.help();
} else {
  program.parse();
}
