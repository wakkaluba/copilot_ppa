import { LLMProvider, ProviderError } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}

export class LLMProviderValidator {
    /**
     * Validates a provider implementation
     */
    public async validateProvider(provider: LLMProvider): Promise<ValidationResult> {
        const errors: string[] = [];

        // Check required properties
        if (!provider.id) {
            errors.push('Provider must have an id');
        }

        // Validate required methods exist and are functions
        const requiredMethods = ['initialize', 'dispose', 'ping', 'getCapabilities'];
        for (const method of requiredMethods) {
            if (!(method in provider) || typeof provider[method as keyof LLMProvider] !== 'function') {
                errors.push(`Provider must implement ${method} method`);
            }
        }

        // Validate event emitter functionality
        const requiredEventMethods = ['on', 'off', 'emit'];
        for (const method of requiredEventMethods) {
            if (!(method in provider) || typeof provider[method as keyof LLMProvider] !== 'function') {
                errors.push(`Provider must implement EventEmitter method: ${method}`);
            }
        }

        try {
            // Test capabilities method
            const capabilities = await provider.getCapabilities();
            if (!capabilities) {
                errors.push('getCapabilities must return a valid capabilities object');
            } else {
                // Validate capabilities structure
                if (typeof capabilities.maxTokens !== 'number') {
                    errors.push('capabilities.maxTokens must be a number');
                }
                if (!Array.isArray(capabilities.supportedModels)) {
                    errors.push('capabilities.supportedModels must be an array');
                }
                if (typeof capabilities.supportsStreaming !== 'boolean') {
                    errors.push('capabilities.supportsStreaming must be a boolean');
                }
                if (typeof capabilities.supportsCompletion !== 'boolean') {
                    errors.push('capabilities.supportsCompletion must be a boolean');
                }
                if (typeof capabilities.supportsChatCompletion !== 'boolean') {
                    errors.push('capabilities.supportsChatCompletion must be a boolean');
                }
            }
        } catch (error) {
            errors.push(`Failed to get provider capabilities: ${error instanceof Error ? error.message : String(error)}`);
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}