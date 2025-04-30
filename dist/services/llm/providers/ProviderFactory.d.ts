import { LLMProvider } from '../llmProvider';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
export declare enum ProviderType {
    Ollama = "ollama",
    LMStudio = "lmstudio",
    Mock = "mock"
}
export declare class ProviderFactory {
    private static instance;
    private constructor();
    static getInstance(): ProviderFactory;
    createProvider(type: ProviderType, config: ProviderConfig): Promise<LLMProvider>;
}
