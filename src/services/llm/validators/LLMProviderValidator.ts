import { LLMProvider } from '../types';

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
        if (!provider.name) {
            errors.push('Provider must have a name');
        }
        if (!provider.id) {
            errors.push('Provider must have an id');
        }

        // Validate required methods exist and are functions
        const requiredMethods = [
            'isAvailable',
            'connect',
            'disconnect',
            'getStatus',
            'getAvailableModels',
            'getModelInfo',
            'generateCompletion',
            'generateChatCompletion',
            'streamCompletion',
            'streamChatCompletion',
            'healthCheck'
        ];
        for (const method of requiredMethods) {
            if (typeof provider[method] !== 'function') {
                errors.push(`Provider must implement ${method} method`);
            }
        }

        // Validate event emitter functionality
        if (!provider.emit || !provider.on || !provider.removeListener) {
            errors.push('Provider must extend EventEmitter');
        }

        try {
            // Test capabilities method
            const capabilities = await provider.getCapabilities();
            if (!capabilities) {
                errors.push('Provider must return capabilities');
            } else {
                // Validate capabilities structure
                const requiredCapabilities = [
                    'supportsStreaming',
                    'supportsCancellation',
                    'supportsModelSwitch',
                    'maxContextLength',
                    'supportedModels'
                ];
                for (const cap of requiredCapabilities) {
                    if (capabilities[cap] === undefined) {
                        errors.push(`Provider capabilities must include ${cap}`);
                    }
                }
            }
        } catch (error) {
            errors.push('Failed to get provider capabilities');
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}