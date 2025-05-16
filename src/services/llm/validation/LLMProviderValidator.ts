import {
    IHealthCheckResult,
    LLMProvider,
    ProviderCapabilities,
    ProviderConfig
} from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export class LLMProviderValidator {
    private static readonly REQUIRED_CONFIG_FIELDS = [
        'apiEndpoint',
        'healthCheck'
    ];

    public validateConfig(config: ProviderConfig): ValidationResult {
        const errors: string[] = [];
        for (const field of LLMProviderValidator.REQUIRED_CONFIG_FIELDS) {
            if (!(field in config)) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        if (config.apiEndpoint) {
            try {
                new URL(config.apiEndpoint);
            } catch {
                errors.push('Invalid API endpoint URL');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    public validateHealth(result: IHealthCheckResult): ValidationResult {
        const errors: string[] = [];
        if (typeof result.isHealthy !== 'boolean') {
            errors.push('Health check must return a boolean isHealthy status');
        }
        if (typeof result.timestamp !== 'number' || result.timestamp < 0) {
            errors.push('Health check timestamp must be a non-negative number');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    public async validateProvider(provider: LLMProvider): Promise<ValidationResult> {
        const errors: string[] = [];
        const requiredMethods = [
            'connect',
            'disconnect',
            'getStatus',
            'getAvailableModels',
            'getModelInfo',
            'getCapabilities',
            'generateCompletion',
            'generateChatCompletion',
            'streamCompletion',
            'streamChatCompletion'
        ];
        for (const method of requiredMethods) {
            if (typeof (provider as any)[method] !== 'function') {
                errors.push(`Provider must implement ${method} method`);
            }
        }
        if (!provider.id || typeof provider.id !== 'string') {
            errors.push('Provider must have a valid string ID');
        }
        const capabilities: ProviderCapabilities = await provider.getCapabilities();
        if (!capabilities) {
            errors.push('Provider must return capabilities');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
