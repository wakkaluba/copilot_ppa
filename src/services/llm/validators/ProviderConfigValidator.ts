export interface ProviderConfig {
    endpoint?: string;
    apiKey?: string;
    modelId?: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
    timeoutMs?: number;
    maxRetries?: number;
    capabilities?: {
        streaming?: boolean;
        modelSelection?: boolean;
        systemPrompts?: boolean;
    };
}
