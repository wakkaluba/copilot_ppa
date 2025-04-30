import { ProviderConfig, HealthCheckResult, ValidationResult, LLMProvider } from '../types';
export declare class LLMProviderValidator {
    private static readonly REQUIRED_CONFIG_FIELDS;
    validateConfig(config: ProviderConfig): ValidationResult;
    validateHealth(result: HealthCheckResult): ValidationResult;
    validateProvider(provider: LLMProvider): Promise<ValidationResult>;
    validateResponse(response: any): ValidationResult;
}
