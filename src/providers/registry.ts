/**
 * Provider Registry
 * 
 * Manages registration and lookup of provider plugins.
 */

import { IProviderPlugin } from './base';
import { OpenAIProvider } from './openai';
import { ClaudeProvider } from './claude';
import { GeminiProvider } from './gemini';

export class ProviderRegistry {
  private providers: Map<string, IProviderPlugin> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    this.register(new OpenAIProvider());
    this.register(new ClaudeProvider());
    this.register(new GeminiProvider());
  }

  register(provider: IProviderPlugin): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): IProviderPlugin | undefined {
    return this.providers.get(name);
  }

  getAll(): IProviderPlugin[] {
    return Array.from(this.providers.values());
  }
}