"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMModelValidator = void 0;
var types_1 = require("../types");
/**
 * Service for validating models and checking compatibility
 */
var LLMModelValidator = /** @class */ (function () {
    function LLMModelValidator() {
    }
    /**
     * Validate a model against requirements
     */
    LLMModelValidator.prototype.validateModel = function (model, requirements) {
        var _a, _b, _c, _d;
        var result = {
            isValid: true,
            errors: [],
            warnings: []
        };
        // Check version compatibility
        if (requirements.minVersion && !this.checkVersion(model.version, requirements.minVersion)) {
            result.errors.push(new types_1.ModelValidationError('version', "Model version ".concat(model.version, " is below minimum required version ").concat(requirements.minVersion)));
        }
        // Check hardware requirements
        if (requirements.hardware) {
            var hardwareIssues = this.validateHardwareRequirements(model.hardwareRequirements, requirements.hardware);
            (_a = result.errors).push.apply(_a, hardwareIssues.errors);
            (_b = result.warnings).push.apply(_b, hardwareIssues.warnings);
        }
        // Check capabilities
        if (requirements.capabilities) {
            var missingCapabilities = this.validateCapabilities(model.capabilities, requirements.capabilities);
            if (missingCapabilities.length > 0) {
                result.errors.push(new types_1.ModelValidationError('capabilities', "Model is missing required capabilities: ".concat(missingCapabilities.join(', '))));
            }
        }
        // Check format compatibility
        if (requirements.formats && !this.validateFormats(model.supportedFormats, requirements.formats)) {
            result.errors.push(new types_1.ModelValidationError('formats', "Model does not support required formats: ".concat(requirements.formats.join(', '))));
        }
        // Check additional parameters
        if (requirements.parameters) {
            var parameterIssues = this.validateParameters(model.parameters, requirements.parameters);
            (_c = result.errors).push.apply(_c, parameterIssues.errors);
            (_d = result.warnings).push.apply(_d, parameterIssues.warnings);
        }
        result.isValid = result.errors.length === 0;
        return result;
    };
    /**
     * Check model compatibility
     */
    LLMModelValidator.prototype.checkCompatibility = function (modelA, modelB) {
        var _a;
        var result = {
            isCompatible: true,
            errors: [],
            warnings: []
        };
        // Check provider compatibility
        if (modelA.provider !== modelB.provider) {
            result.warnings.push("Models use different providers: ".concat(modelA.provider, " vs ").concat(modelB.provider));
        }
        // Check version compatibility
        if (modelA.version && modelB.version) {
            var versionCompatible = this.checkVersionCompatibility(modelA.version, modelB.version);
            if (!versionCompatible) {
                result.warnings.push("Version mismatch: ".concat(modelA.version, " vs ").concat(modelB.version));
            }
        }
        // Check hardware requirements compatibility
        var hardwareCompatible = this.checkHardwareCompatibility(modelA.hardwareRequirements, modelB.hardwareRequirements);
        if (!hardwareCompatible.isCompatible) {
            (_a = result.errors).push.apply(_a, hardwareCompatible.conflicts);
        }
        // Check capability overlap
        var capabilityOverlap = this.getCapabilityOverlap(modelA.capabilities, modelB.capabilities);
        if (capabilityOverlap.length === 0) {
            result.errors.push('No overlapping capabilities between models');
        }
        result.isCompatible = result.errors.length === 0;
        return result;
    };
    /**
     * Validate hardware requirements
     */
    LLMModelValidator.prototype.validateHardwareRequirements = function (actual, required) {
        var result = { errors: [], warnings: [] };
        if (!actual) {
            result.warnings.push('Hardware requirements not specified');
            return result;
        }
        if (required.minMemoryGB && (!actual.minMemoryGB || actual.minMemoryGB < required.minMemoryGB)) {
            result.errors.push(new types_1.ModelValidationError('memory', "Insufficient memory: ".concat(actual.minMemoryGB, "GB < ").concat(required.minMemoryGB, "GB")));
        }
        if (required.minCPUCores && (!actual.minCPUCores || actual.minCPUCores < required.minCPUCores)) {
            result.errors.push(new types_1.ModelValidationError('cpu', "Insufficient CPU cores: ".concat(actual.minCPUCores, " < ").concat(required.minCPUCores)));
        }
        if (required.gpuRequired && !actual.gpuRequired) {
            result.errors.push(new types_1.ModelValidationError('gpu', 'GPU required but not available'));
        }
        return result;
    };
    /**
     * Validate model capabilities
     */
    LLMModelValidator.prototype.validateCapabilities = function (actual, required) {
        var missingCapabilities = required.filter(function (cap) { return !actual.includes(cap); });
        return missingCapabilities;
    };
    /**
     * Validate supported formats
     */
    LLMModelValidator.prototype.validateFormats = function (actual, required) {
        if (!actual) {
            return false;
        }
        return required.every(function (format) { return actual.includes(format); });
    };
    /**
     * Validate model parameters
     */
    LLMModelValidator.prototype.validateParameters = function (actual, required) {
        var result = { errors: [], warnings: [] };
        if (!actual) {
            result.warnings.push('Model parameters not specified');
            return result;
        }
        for (var _i = 0, _a = Object.entries(required); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (!(key in actual)) {
                result.errors.push(new types_1.ModelValidationError('parameter', "Missing required parameter: ".concat(key)));
                continue;
            }
            if (typeof actual[key] !== typeof value) {
                result.errors.push(new types_1.ModelValidationError('parameter', "Invalid type for parameter ".concat(key, ": expected ").concat(typeof value, ", got ").concat(typeof actual[key])));
            }
        }
        return result;
    };
    /**
     * Check version compatibility
     */
    LLMModelValidator.prototype.checkVersion = function (actual, required) {
        if (!actual) {
            return false;
        }
        var _a = actual.split('.').map(Number), actualMajor = _a[0], _b = _a[1], actualMinor = _b === void 0 ? 0 : _b;
        var _c = required.split('.').map(Number), requiredMajor = _c[0], _d = _c[1], requiredMinor = _d === void 0 ? 0 : _d;
        if (actualMajor !== requiredMajor) {
            return actualMajor > requiredMajor;
        }
        return actualMinor >= requiredMinor;
    };
    /**
     * Check version compatibility between models
     */
    LLMModelValidator.prototype.checkVersionCompatibility = function (versionA, versionB) {
        var majorA = versionA.split('.').map(Number)[0];
        var majorB = versionB.split('.').map(Number)[0];
        return majorA === majorB;
    };
    /**
     * Check hardware compatibility between models
     */
    LLMModelValidator.prototype.checkHardwareCompatibility = function (hwA, hwB) {
        var result = { isCompatible: true, conflicts: [] };
        if (!hwA || !hwB) {
            result.isCompatible = true;
            return result;
        }
        // Check memory requirements
        var minMemory = Math.max(hwA.minMemoryGB || 0, hwB.minMemoryGB || 0);
        var maxMemory = Math.min(hwA.maxMemoryGB || Infinity, hwB.maxMemoryGB || Infinity);
        if (minMemory > maxMemory) {
            result.conflicts.push("Incompatible memory requirements: ".concat(minMemory, "GB > ").concat(maxMemory, "GB"));
        }
        // Check CPU requirements
        var minCPU = Math.max(hwA.minCPUCores || 0, hwB.minCPUCores || 0);
        var maxCPU = Math.min(hwA.maxCPUCores || Infinity, hwB.maxCPUCores || Infinity);
        if (minCPU > maxCPU) {
            result.conflicts.push("Incompatible CPU requirements: ".concat(minCPU, " > ").concat(maxCPU, " cores"));
        }
        // Check GPU requirements
        if (hwA.gpuRequired !== hwB.gpuRequired) {
            result.conflicts.push('Inconsistent GPU requirements');
        }
        result.isCompatible = result.conflicts.length === 0;
        return result;
    };
    /**
     * Get overlapping capabilities between models
     */
    LLMModelValidator.prototype.getCapabilityOverlap = function (capabilitiesA, capabilitiesB) {
        return capabilitiesA.filter(function (cap) { return capabilitiesB.includes(cap); });
    };
    return LLMModelValidator;
}());
exports.LLMModelValidator = LLMModelValidator;
