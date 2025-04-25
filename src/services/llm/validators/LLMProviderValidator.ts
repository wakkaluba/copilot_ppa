import { LLMProvider, ProviderCapabilities } from '../../../llm/types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export class LLMProviderValidator {
    /**
     * Validates an LLM provider implementation
     * @param provider The provider to validate
     * @returns Validation result indicating if the provider is valid
     */
    validate(provider: LLMProvider): ValidationResult {
        const errors: string[] = [];
        
        // Check for required methods
        this.validateRequiredMethods(provider, errors);
        
        // Validate capabilities object
        if (provider.getCapabilities) {
            const capabilities = provider.getCapabilities();
            this.validateCapabilities(capabilities, errors);
        } else {
            errors.push('Provider must implement getCapabilities method');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : []
        };
    }
    
    private validateRequiredMethods(provider: LLMProvider, errors: string[]): void {
        const requiredMethods = [
            'getName',
            'getCapabilities',
            'isAvailable',
            'getStatus',
            'completePrompt'
        ];
        
        for (const method of requiredMethods) {
            if (typeof provider[method] !== 'function') {
                errors.push(`Provider must implement ${method} method`);
            }
        }
        
        // Check for stream support consistency
        const capabilities = provider.getCapabilities?.();
        if (capabilities?.streamingSupport && typeof provider.streamPrompt !== 'function') {
            errors.push('Provider claims to support streaming but does not implement streamPrompt method');
        }
    }
    
    private validateCapabilities(capabilities: ProviderCapabilities, errors: string[]): void {
        // Check for required capability properties
        const requiredCapabilities = [
            'maxContextTokens',
            'streamingSupport',
            'supportedFormats',
            'multimodalSupport',
            'supportsTemperature',
            'supportsTopP',
            'supportsPenalties',
            'supportsRetries'
        ];
        
        for (const cap of requiredCapabilities) {
            if (capabilities[cap] === undefined) {
                errors.push(`Provider capabilities must include ${cap} property`);
            }
        }
        
        // Validate specific capability constraints
        if (capabilities.maxContextTokens <= 0) {
            errors.push('maxContextTokens must be greater than 0');
        }
        
        if (!Array.isArray(capabilities.supportedFormats) || capabilities.supportedFormats.length === 0) {
            errors.push('supportedFormats must be a non-empty array');
        }
    }
}