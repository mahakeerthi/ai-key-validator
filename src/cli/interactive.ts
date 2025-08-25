/**
 * Interactive CLI Mode
 * 
 * This module will handle interactive CLI prompts and user interaction.
 */

// Placeholder for future interactive CLI implementations
export interface InteractiveSession {
  start(): Promise<void>;
  prompt(question: string): Promise<string>;
}