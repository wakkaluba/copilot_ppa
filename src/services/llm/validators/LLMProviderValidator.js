"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderValidator = void 0;
var LLMProviderValidator = /** @class */ (function () {
    function LLMProviderValidator() {
    }
    /**
     * Validates an LLM provider implementation
     * @param provider The provider to validate
     * @returns Validation result indicating if the provider is valid
     */
    LLMProviderValidator.prototype.validate = function (provider) {
        var errors = [];
        // Check for required methods
        this.validateRequiredMethods(provider, errors);
        // Validate capabilities object
        if (provider.getCapabilities) {
            var capabilities = provider.getCapabilities();
            this.validateCapabilities(capabilities, errors);
        }
        else {
            errors.push('Provider must implement getCapabilities method');
        }
        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : []
        };
    };
    LLMProviderValidator.prototype.validateRequiredMethods = function (provider, errors) {
        var _a;
        var requiredMethods = [
            'getName',
            'getCapabilities',
            'isAvailable',
            'getStatus',
            'completePrompt'
        ];
        for (var _i = 0, requiredMethods_1 = requiredMethods; _i < requiredMethods_1.length; _i++) {
            var method = requiredMethods_1[_i];
            if (typeof provider[method] !== 'function') {
                errors.push("Provider must implement ".concat(method, " method"));
            }
        }
        // Check for stream support consistency
        var capabilities = (_a = provider.getCapabilities) === null || _a === void 0 ? void 0 : _a.call(provider);
        if ((capabilities === null || capabilities === void 0 ? void 0 : capabilities.streamingSupport) && typeof provider.streamPrompt !== 'function') {
            errors.push('Provider claims to support streaming but does not implement streamPrompt method');
        }
    };
    LLMProviderValidator.prototype.validateCapabilities = function (capabilities, errors) {
        // Check for required capability properties
        var requiredCapabilities = [
            'maxContextTokens',
            'streamingSupport',
            'supportedFormats',
            'multimodalSupport',
            'supportsTemperature',
            'supportsTopP',
            'supportsPenalties',
            'supportsRetries'
        ];
        for (var _i = 0, requiredCapabilities_1 = requiredCapabilities; _i < requiredCapabilities_1.length; _i++) {
            var cap = requiredCapabilities_1[_i];
            if (capabilities[cap] === undefined) {
                errors.push("Provider capabilities must include ".concat(cap, " property"));
            }
        }
        // Validate specific capability constraints
        if (capabilities.maxContextTokens <= 0) {
            errors.push('maxContextTokens must be greater than 0');
        }
        if (!Array.isArray(capabilities.supportedFormats) || capabilities.supportedFormats.length === 0) {
            errors.push('supportedFormats must be a non-empty array');
        }
    };
    return LLMProviderValidator;
}());
exports.LLMProviderValidator = LLMProviderValidator;
