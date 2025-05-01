import { ILLMProvider } from '../llm/llmProvider';
import { LMStudioProvider } from '../llm/lmStudioProvider';
import { OllamaProvider } from '../llm/ollamaProvider';

export interface IModelConfig {
    name: string;
    provider: 'ollama' | 'lmstudio';
    endpoint: string;
    parameters: Record<string, any>;
}

export class ModelManager {
    private activeModel: ILLMProvider | null = null;
    private models: Map<string, IModelConfig> = new Map();
    private providers: Map<string, ILLMProvider> = new Map();

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        this.providers.set('ollama', new OllamaProvider());
        this.providers.set('lmstudio', new LMStudioProvider());
    }

    async addModel(config: IModelConfig): Promise<void> {
        this.models.set(config.name, config);
    }

    async switchModel(modelName: string): Promise<void> {
        const config = this.models.get(modelName);
        if (!config) {throw new Error(`Model ${modelName} not found`);}

        const provider = this.providers.get(config.provider);
        if (!provider) {throw new Error(`Provider ${config.provider} not found`);}

        await provider.initialize(config);
        this.activeModel = provider;
    }

    getActiveModel(): ILLMProvider {
        if (!this.activeModel) {throw new Error('No active model');}
        return this.activeModel;
    }

    getAvailableModels(): string[] {
        return Array.from(this.models.keys());
    }
}
