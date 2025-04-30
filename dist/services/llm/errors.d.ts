export declare class LLMConnectionError extends Error {
    readonly code: string;
    constructor(code: string, message: string);
}
export declare class ConfigurationError extends Error {
    readonly providerId: string;
    readonly setting: string;
    constructor(message: string, providerId: string, setting: string);
}
export declare class ProviderError extends Error {
    readonly providerId: string;
    constructor(message: string, providerId: string);
}
export declare class ModelNotFoundError extends Error {
    constructor(modelId: string);
}
