import { ValidationResult } from './LLMProviderValidator';

export interface ProviderConfig {
    id: string;
    name: string;
    apiEndpoint: string;
    apiKey?: string;
    defaultModel: string;
    models: ModelConfig[];
    defaultRequestOptions?: Record<string, any>;
    timeout?: number;
    retries?: number;
    requestTimeout?: number;
    connection?: {
        poolSize?: number;
        timeout?: number;
    };
    healthCheck?: {
        interval: number;
        timeout: number;
    };
}

export interface ModelConfig {
    id: string;
    name: string;
    contextWindow: number;
    inputCostPer1K?: number;
    outputCostPer1K?: number;
    trainingData?: string;
    capabilities?: string[];
    supportedLanguages?: string[];
    apiParams?: Record<string, any>;
}

export class ProviderConfigValidator {
    /**
     * Validates a provider configuration
     * @param config The provider configuration to validate
     * @returns Validation result indicating if the config is valid
     */
    validate(config: ProviderConfig): ValidationResult {
        const errors: string[] = [];
        
        // Validate required fields
        if (!config.id) {
            errors.push('Provider config must include an id');
        }
        
        if (!config.name) {
            errors.push('Provider config must include a name');
        }
        
        if (!config.apiEndpoint) {
            errors.push('Provider config must include an apiEndpoint');
        } else if (!this.isValidUrl(config.apiEndpoint)) {
            errors.push('Provider config apiEndpoint must be a valid URL');
        }
        
        if (!config.defaultModel) {
            errors.push('Provider config must include a defaultModel');
        }
        
        // Validate models array
        if (!Array.isArray(config.models) || config.models.length === 0) {
            errors.push('Provider config must include at least one model');
        } else {
            // Validate each model in the array
            config.models.forEach((model, index) => {
                this.validateModelConfig(model, index, errors);
            });
            
            // Check if defaultModel exists in models array
            const hasDefaultModel = config.models.some(model => model.id === config.defaultModel);
            if (!hasDefaultModel) {
                errors.push(`Default model "${config.defaultModel}" is not defined in models array`);
            }
        }
        
        // Validate timeout and retries if provided
        if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
            errors.push('Timeout must be a positive number');
        }
        
        if (config.retries !== undefined && (typeof config.retries !== 'number' || config.retries < 0 || !Number.isInteger(config.retries))) {
            errors.push('Retries must be a non-negative integer');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : []
        };
    }
    
    private validateModelConfig(model: ModelConfig, index: number, errors: string[]): void {
        if (!model.id) {
            errors.push(`Model at index ${index} must have an id`);
        }
        
        if (!model.name) {
            errors.push(`Model at index ${index} must have a name`);
        }
        
        if (typeof model.contextWindow !== 'number' || model.contextWindow <= 0) {
            errors.push(`Model "${model.id}" must have a valid contextWindow (positive number)`);
        }
        
        // Validate cost properties if provided
        if (model.inputCostPer1K !== undefined && (typeof model.inputCostPer1K !== 'number' || model.inputCostPer1K < 0)) {
            errors.push(`Model "${model.id}" inputCostPer1K must be a non-negative number`);
        }
        
        if (model.outputCostPer1K !== undefined && (typeof model.outputCostPer1K !== 'number' || model.outputCostPer1K < 0)) {
            errors.push(`Model "${model.id}" outputCostPer1K must be a non-negative number`);
        }
        
        // Validate capabilities array if provided
        if (model.capabilities !== undefined && !Array.isArray(model.capabilities)) {
            errors.push(`Model "${model.id}" capabilities must be an array`);
        }
        
        // Validate supported languages array if provided
        if (model.supportedLanguages !== undefined && !Array.isArray(model.supportedLanguages)) {
            errors.push(`Model "${model.id}" supportedLanguages must be an array`);
        }
    }
    
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}