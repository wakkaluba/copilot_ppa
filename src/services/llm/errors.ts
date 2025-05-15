export class LLMConnectionError extends Error {
    constructor(public readonly code: string, message: string) {
        super(message);
        this.name = 'LLMConnectionError';
    }
}

export class ConfigurationError extends Error {
    constructor(message: string, public readonly providerId: string, public readonly setting: string) {
        super(message);
        this.name = 'ConfigurationError';
    }
}

export class ProviderError extends Error {
    constructor(message: string, public readonly providerId: string) {
        super(message);
        this.name = 'ProviderError';
    }
}

export class ModelNotFoundError extends Error {
    constructor(modelId: string) {
        super(`Model ${modelId} not found`);
        this.name = 'ModelNotFoundError';
    }
}

export class ModelValidationError extends Error {
    constructor(public readonly field: string, message: string) {
        super(message);
        this.name = 'ModelValidationError';
    }
}
