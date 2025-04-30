import { LLMProvider } from '../llm/llmProvider';
export interface ModelConfig {
    name: string;
    provider: 'ollama' | 'lmstudio';
    endpoint: string;
    parameters: Record<string, any>;
}
export declare class ModelManager {
    private activeModel;
    private models;
    private providers;
    constructor();
    private initializeProviders;
    addModel(config: ModelConfig): Promise<void>;
    switchModel(modelName: string): Promise<void>;
    getActiveModel(): LLMProvider;
    getAvailableModels(): string[];
}
