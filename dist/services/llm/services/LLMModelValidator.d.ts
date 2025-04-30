import { ModelInfo, ModelRequirements, ModelValidationResult, ModelCompatibilityResult } from '../types';
/**
 * Service for validating models and checking compatibility
 */
export declare class LLMModelValidator {
    /**
     * Validate a model against requirements
     */
    validateModel(model: ModelInfo, requirements: ModelRequirements): ModelValidationResult;
    /**
     * Check model compatibility
     */
    checkCompatibility(modelA: ModelInfo, modelB: ModelInfo): ModelCompatibilityResult;
    /**
     * Validate hardware requirements
     */
    private validateHardwareRequirements;
    /**
     * Validate model capabilities
     */
    private validateCapabilities;
    /**
     * Validate supported formats
     */
    private validateFormats;
    /**
     * Validate model parameters
     */
    private validateParameters;
    /**
     * Check version compatibility
     */
    private checkVersion;
    /**
     * Check version compatibility between models
     */
    private checkVersionCompatibility;
    /**
     * Check hardware compatibility between models
     */
    private checkHardwareCompatibility;
    /**
     * Get overlapping capabilities between models
     */
    private getCapabilityOverlap;
}
