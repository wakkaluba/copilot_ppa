import { LLMProvider } from '../types';
export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}
export declare class LLMProviderValidator {
    /**
     * Validates a provider implementation
     */
    validateProvider(provider: LLMProvider): Promise<ValidationResult>;
}
