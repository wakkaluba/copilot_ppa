import { ProviderConfig } from '../types';

export interface ConfigValidationResult {
    isValid: boolean;
    errors?: string[];
}

export class ProviderConfigValidator {
    /**
     * Validates provider configuration
     */
    public async validateConfig(config: ProviderConfig): Promise<ConfigValidationResult> {
        const errors: string[] = [];

        // Validate baseUrl if provided
        if (config.baseUrl) {
            try {
                new URL(config.baseUrl);
            } catch {
                errors.push('baseUrl must be a valid URL');
            }
        }

        // Validate maxTokens if provided
        if (config.maxTokens !== undefined) {
            if (!Number.isInteger(config.maxTokens) || config.maxTokens <= 0) {
                errors.push('maxTokens must be a positive integer');
            }
        }

        // Validate temperature if provided
        if (config.temperature !== undefined) {
            if (typeof config.temperature !== 'number' || 
                config.temperature < 0 || 
                config.temperature > 1) {
                errors.push('temperature must be a number between 0 and 1');
            }
        }

        // Validate timeout if provided
        if (config.timeout !== undefined) {
            if (!Number.isInteger(config.timeout) || config.timeout < 0) {
                errors.push('timeout must be a non-negative integer');
            }
        }

        // Validate retry options if provided
        if (config.retryOptions) {
            if (!Number.isInteger(config.retryOptions.maxRetries) || 
                config.retryOptions.maxRetries < 0) {
                errors.push('retryOptions.maxRetries must be a non-negative integer');
            }
            if (!Number.isInteger(config.retryOptions.delayMs) || 
                config.retryOptions.delayMs < 0) {
                errors.push('retryOptions.delayMs must be a non-negative integer');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
}