import { LLMModel } from '../llm/llmModel';
import { E2ETestConfig } from '../services/testRunner/e2eTestConfig';
import { LLMRequestOptions } from '../llm-providers/types';

export class ConfigValidator {
    private static readonly VALID_FRAMEWORKS = ['cypress', 'playwright', 'puppeteer', 'selenium', 'testcafe', 'other'] as const;
    private static readonly VALID_BROWSERS = ['chrome', 'firefox', 'edge', 'safari'] as const;
    private static readonly VALID_PROVIDERS = ['ollama', 'lmstudio', 'huggingface'] as const;

    /**
     * Validates LLM request options
     * @throws Error if validation fails
     */
    static validateLLMRequestOptions(options: LLMRequestOptions): void {
        if (!options || typeof options !== 'object') {
            throw new Error('Request options must be a valid object');
        }

        this.validateNumberInRange('temperature', options.temperature, 0, 1);
        this.validatePositiveInteger('maxTokens', options.maxTokens);
        this.validateStringArray('stopSequences', options.stopSequences);
        
        // Validate optional fields
        if (options.stream !== undefined && typeof options.stream !== 'boolean') {
            throw new Error('stream must be a boolean value');
        }
    }

    /**
     * Validates E2E test configuration
     * @throws Error if validation fails
     */
    static validateE2EConfig(config: E2ETestConfig): void {
        if (!config || typeof config !== 'object') {
            throw new Error('E2E config must be a valid object');
        }

        this.validateEnumValue('framework', config.framework, this.VALID_FRAMEWORKS);
        this.validateRequiredString('command', config.command);

        if (config.browser !== undefined) {
            this.validateEnumValue('browser', config.browser, this.VALID_BROWSERS);
        }

        if (config.headless !== undefined && typeof config.headless !== 'boolean') {
            throw new Error('headless must be a boolean value');
        }

        // Validate environment variables if present
        if (config.env) {
            this.validateEnvironmentVariables(config.env);
        }
    }

    /**
     * Validates LLM model configuration
     * @throws Error if validation fails
     */
    static validateLLMModel(model: LLMModel): void {
        if (!model || typeof model !== 'object') {
            throw new Error('Model config must be a valid object');
        }

        this.validateRequiredString('id', model.id);
        this.validateRequiredString('name', model.name);
        this.validateEnumValue('provider', model.provider, this.VALID_PROVIDERS);
        
        if (model.contextLength !== undefined) {
            this.validatePositiveInteger('contextLength', model.contextLength);
        }

        if (model.baseUrl !== undefined) {
            this.validateUrl('baseUrl', model.baseUrl);
        }

        if (model.pricing) {
            this.validatePricing(model.pricing);
        }

        // Validate supported languages
        if (!Array.isArray(model.supportedLanguages) || model.supportedLanguages.length === 0) {
            throw new Error('At least one supported language must be specified');
        }
    }

    // Utility validation methods
    private static validateNumberInRange(field: string, value: number | undefined, min: number, max: number): void {
        if (value !== undefined) {
            if (typeof value !== 'number' || value < min || value > max) {
                throw new Error(`${field} must be a number between ${min} and ${max}`);
            }
        }
    }

    private static validatePositiveInteger(field: string, value: number | undefined): void {
        if (value !== undefined) {
            if (!Number.isInteger(value) || value <= 0) {
                throw new Error(`${field} must be a positive integer`);
            }
        }
    }

    private static validateStringArray(field: string, value: string[] | undefined): void {
        if (value !== undefined) {
            if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) {
                throw new Error(`${field} must be an array of strings`);
            }
        }
    }

    private static validateRequiredString(field: string, value: string | undefined): void {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new Error(`${field} is required and must be a non-empty string`);
        }
    }

    private static validateEnumValue<T extends string>(field: string, value: string, validValues: readonly T[]): void {
        if (!validValues.includes(value as T)) {
            throw new Error(`Invalid ${field}. Must be one of: ${validValues.join(', ')}`);
        }
    }

    private static validateUrl(field: string, value: string): void {
        try {
            new URL(value);
        } catch {
            throw new Error(`${field} must be a valid URL`);
        }
    }

    private static validateEnvironmentVariables(env: Record<string, string>): void {
        for (const [key, value] of Object.entries(env)) {
            if (typeof key !== 'string' || key.trim().length === 0) {
                throw new Error('Environment variable keys must be non-empty strings');
            }
            if (typeof value !== 'string') {
                throw new Error('Environment variable values must be strings');
            }
        }
    }

    private static validatePricing(pricing: { input?: number; output?: number }): void {
        if (pricing.input !== undefined) {
            this.validateNonNegativeNumber('pricing.input', pricing.input);
        }
        if (pricing.output !== undefined) {
            this.validateNonNegativeNumber('pricing.output', pricing.output);
        }
    }

    private static validateNonNegativeNumber(field: string, value: number): void {
        if (typeof value !== 'number' || value < 0) {
            throw new Error(`${field} must be a non-negative number`);
        }
    }
}