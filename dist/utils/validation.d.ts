import { LLMModel } from '../llm/llmModel';
import { E2ETestConfig } from '../services/testRunner/e2eTestConfig';
import { LLMRequestOptions } from '../llm-providers/types';
export declare class ConfigValidator {
    private static readonly VALID_FRAMEWORKS;
    private static readonly VALID_BROWSERS;
    private static readonly VALID_PROVIDERS;
    /**
     * Validates LLM request options
     * @throws Error if validation fails
     */
    static validateLLMRequestOptions(options: LLMRequestOptions): void;
    /**
     * Validates E2E test configuration
     * @throws Error if validation fails
     */
    static validateE2EConfig(config: E2ETestConfig): void;
    /**
     * Validates LLM model configuration
     * @throws Error if validation fails
     */
    static validateLLMModel(model: LLMModel): void;
    private static validateNumberInRange;
    private static validatePositiveInteger;
    private static validateStringArray;
    private static validateRequiredString;
    private static validateEnumValue;
    private static validateUrl;
    private static validateEnvironmentVariables;
    private static validatePricing;
    private static validateNonNegativeNumber;
}
