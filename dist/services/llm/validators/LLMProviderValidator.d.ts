import { LLMProvider } from '../../../llm/types';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare class LLMProviderValidator {
    /**
     * Validates an LLM provider implementation
     * @param provider The provider to validate
     * @returns Validation result indicating if the provider is valid
     */
    validate(provider: LLMProvider): ValidationResult;
    private validateRequiredMethods;
    private validateCapabilities;
}
