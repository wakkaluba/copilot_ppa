import { LLMProvider } from '../llmProvider';
import { ProviderConfig } from '../validators/ProviderConfigValidator';

export enum ProviderType {
    Ollama = 'ollama',
    LMStudio = 'lmstudio',
    Mock = 'mock'
}

export class ProviderFactory {
    private static instance: ProviderFactory;

    private constructor() {}

    public static getInstance(): ProviderFactory {
        if (!this.instance) {
            this.instance = new ProviderFactory();
        }
        return this.instance;
    }

    public async createProvider(type: ProviderType, config: ProviderConfig): Promise<LLMProvider> {
        // In a test environment, always return the provided mock
        if (process.env.NODE_ENV === 'test' && config.provider) {
            return config.provider as LLMProvider;
        }

        // In production, this would dynamically load and initialize the correct provider
        throw new Error('Not implemented in tests');
    }
}