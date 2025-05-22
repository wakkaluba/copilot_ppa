import { LLMProviderError } from '../errors';
import { ILLMProvider } from '../llmProvider';

export enum ProviderType {
  Ollama = 'ollama',
  LMStudio = 'lmstudio',
  Mock = 'mock',
}

export class ProviderFactory {
  private static instance: ProviderFactory;
  private constructor() {}
  static getInstance(): ProviderFactory {
    if (!ProviderFactory.instance) {
      ProviderFactory.instance = new ProviderFactory();
    }
    return ProviderFactory.instance;
  }
  /**
   * Creates an LLM provider instance.
   * @throws {LLMProviderError} If the method is not implemented.
   */
  async createProvider(): Promise<ILLMProvider> {
    throw new LLMProviderError('NOT_IMPLEMENTED', 'ProviderFactory.createProvider is a stub.');
  }
}
