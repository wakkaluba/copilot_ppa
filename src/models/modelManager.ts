import { LLMProvider } from '../llm/llmProvider';
import { OllamaProvider } from '../llm/ollamaProvider';
import { LMStudioProvider } from '../llm/lmStudioProvider';

export interface ModelConfig {
    name: string;
    provider: 'ollama' | 'lmstudio';
    endpoint: string;
    parameters: Record<string, any>;
}

export class ModelManager {
    private activeModel: LLMProvider | null = null;
    private models: Map<string, ModelConfig> = new Map();
    private providers: Map<string, LLMProvider> = new Map();

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        this.providers.set('ollama', new OllamaProvider());
        this.providers.set('lmstudio', new LMStudioProvider());
    }

    async addModel(config: ModelConfig): Promise<void> {
        this.models.set(config.name, config);
    }

    async switchModel(modelName: string): Promise<void> {
        const config = this.models.get(modelName);
        if (!config) throw new Error(`Model ${modelName} not found`);
        
        const provider = this.providers.get(config.provider);
        if (!provider) throw new Error(`Provider ${config.provider} not found`);
        
        await provider.initialize(config);
        this.activeModel = provider;
    }

    getActiveModel(): LLMProvider {
        if (!this.activeModel) throw new Error('No active model');
        return this.activeModel;
    }

    getAvailableModels(): string[] {
        return Array.from(this.models.keys());
    }
}
