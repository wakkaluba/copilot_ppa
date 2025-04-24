"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelValidator = void 0;
const types_1 = require("../types");
/**
 * Service for validating models and checking compatibility
 */
class LLMModelValidator {
    /**
     * Validate a model against requirements
     */
    validateModel(model, requirements) {
        const result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        // Check version compatibility
        if (requirements.minVersion && !this.checkVersion(model.version, requirements.minVersion)) {
            result.errors.push(new types_1.ModelValidationError('version', `Model version ${model.version} is below minimum required version ${requirements.minVersion}`));
        }
        // Check hardware requirements
        if (requirements.hardware) {
            const hardwareIssues = this.validateHardwareRequirements(model.hardwareRequirements, requirements.hardware);
            result.errors.push(...hardwareIssues.errors);
            result.warnings.push(...hardwareIssues.warnings);
        }
        // Check capabilities
        if (requirements.capabilities) {
            const missingCapabilities = this.validateCapabilities(model.capabilities, requirements.capabilities);
            if (missingCapabilities.length > 0) {
                result.errors.push(new types_1.ModelValidationError('capabilities', `Model is missing required capabilities: ${missingCapabilities.join(', ')}`));
            }
        }
        // Check format compatibility
        if (requirements.formats && !this.validateFormats(model.supportedFormats, requirements.formats)) {
            result.errors.push(new types_1.ModelValidationError('formats', `Model does not support required formats: ${requirements.formats.join(', ')}`));
        }
        // Check additional parameters
        if (requirements.parameters) {
            const parameterIssues = this.validateParameters(model.parameters, requirements.parameters);
            result.errors.push(...parameterIssues.errors);
            result.warnings.push(...parameterIssues.warnings);
        }
        result.isValid = result.errors.length === 0;
        return result;
    }
    /**
     * Check model compatibility
     */
    checkCompatibility(modelA, modelB) {
        const result = {
            isCompatible: true,
            errors: [],
            warnings: []
        };
        // Check provider compatibility
        if (modelA.provider !== modelB.provider) {
            result.warnings.push(`Models use different providers: ${modelA.provider} vs ${modelB.provider}`);
        }
        // Check version compatibility
        if (modelA.version && modelB.version) {
            const versionCompatible = this.checkVersionCompatibility(modelA.version, modelB.version);
            if (!versionCompatible) {
                result.warnings.push(`Version mismatch: ${modelA.version} vs ${modelB.version}`);
            }
        }
        // Check hardware requirements compatibility
        const hardwareCompatible = this.checkHardwareCompatibility(modelA.hardwareRequirements, modelB.hardwareRequirements);
        if (!hardwareCompatible.isCompatible) {
            result.errors.push(...hardwareCompatible.conflicts);
        }
        // Check capability overlap
        const capabilityOverlap = this.getCapabilityOverlap(modelA.capabilities, modelB.capabilities);
        if (capabilityOverlap.length === 0) {
            result.errors.push('No overlapping capabilities between models');
        }
        result.isCompatible = result.errors.length === 0;
        return result;
    }
    /**
     * Validate hardware requirements
     */
    validateHardwareRequirements(actual, required) {
        const result = { errors: [], warnings: [] };
        if (!actual) {
            result.warnings.push('Hardware requirements not specified');
            return result;
        }
        if (required.minMemoryGB && (!actual.minMemoryGB || actual.minMemoryGB < required.minMemoryGB)) {
            result.errors.push(new types_1.ModelValidationError('memory', `Insufficient memory: ${actual.minMemoryGB}GB < ${required.minMemoryGB}GB`));
        }
        if (required.minCPUCores && (!actual.minCPUCores || actual.minCPUCores < required.minCPUCores)) {
            result.errors.push(new types_1.ModelValidationError('cpu', `Insufficient CPU cores: ${actual.minCPUCores} < ${required.minCPUCores}`));
        }
        if (required.gpuRequired && !actual.gpuRequired) {
            result.errors.push(new types_1.ModelValidationError('gpu', 'GPU required but not available'));
        }
        return result;
    }
    /**
     * Validate model capabilities
     */
    validateCapabilities(actual, required) {
        const missingCapabilities = required.filter(cap => !actual.includes(cap));
        return missingCapabilities;
    }
    /**
     * Validate supported formats
     */
    validateFormats(actual, required) {
        if (!actual) {
            return false;
        }
        return required.every(format => actual.includes(format));
    }
    /**
     * Validate model parameters
     */
    validateParameters(actual, required) {
        const result = { errors: [], warnings: [] };
        if (!actual) {
            result.warnings.push('Model parameters not specified');
            return result;
        }
        for (const [key, value] of Object.entries(required)) {
            if (!(key in actual)) {
                result.errors.push(new types_1.ModelValidationError('parameter', `Missing required parameter: ${key}`));
                continue;
            }
            if (typeof actual[key] !== typeof value) {
                result.errors.push(new types_1.ModelValidationError('parameter', `Invalid type for parameter ${key}: expected ${typeof value}, got ${typeof actual[key]}`));
            }
        }
        return result;
    }
    /**
     * Check version compatibility
     */
    checkVersion(actual, required) {
        if (!actual) {
            return false;
        }
        const [actualMajor, actualMinor = 0] = actual.split('.').map(Number);
        const [requiredMajor, requiredMinor = 0] = required.split('.').map(Number);
        if (actualMajor !== requiredMajor) {
            return actualMajor > requiredMajor;
        }
        return actualMinor >= requiredMinor;
    }
    /**
     * Check version compatibility between models
     */
    checkVersionCompatibility(versionA, versionB) {
        const [majorA] = versionA.split('.').map(Number);
        const [majorB] = versionB.split('.').map(Number);
        return majorA === majorB;
    }
    /**
     * Check hardware compatibility between models
     */
    checkHardwareCompatibility(hwA, hwB) {
        const result = { isCompatible: true, conflicts: [] };
        if (!hwA || !hwB) {
            result.isCompatible = true;
            return result;
        }
        // Check memory requirements
        const minMemory = Math.max(hwA.minMemoryGB || 0, hwB.minMemoryGB || 0);
        const maxMemory = Math.min(hwA.maxMemoryGB || Infinity, hwB.maxMemoryGB || Infinity);
        if (minMemory > maxMemory) {
            result.conflicts.push(`Incompatible memory requirements: ${minMemory}GB > ${maxMemory}GB`);
        }
        // Check CPU requirements
        const minCPU = Math.max(hwA.minCPUCores || 0, hwB.minCPUCores || 0);
        const maxCPU = Math.min(hwA.maxCPUCores || Infinity, hwB.maxCPUCores || Infinity);
        if (minCPU > maxCPU) {
            result.conflicts.push(`Incompatible CPU requirements: ${minCPU} > ${maxCPU} cores`);
        }
        // Check GPU requirements
        if (hwA.gpuRequired !== hwB.gpuRequired) {
            result.conflicts.push('Inconsistent GPU requirements');
        }
        result.isCompatible = result.conflicts.length === 0;
        return result;
    }
    /**
     * Get overlapping capabilities between models
     */
    getCapabilityOverlap(capabilitiesA, capabilitiesB) {
        return capabilitiesA.filter(cap => capabilitiesB.includes(cap));
    }
}
exports.LLMModelValidator = LLMModelValidator;
//# sourceMappingURL=LLMModelValidator.js.map