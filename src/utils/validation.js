"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigValidator = void 0;
var ConfigValidator = /** @class */ (function () {
    function ConfigValidator() {
    }
    /**
     * Validates LLM request options
     * @throws Error if validation fails
     */
    ConfigValidator.validateLLMRequestOptions = function (options) {
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
    };
    /**
     * Validates E2E test configuration
     * @throws Error if validation fails
     */
    ConfigValidator.validateE2EConfig = function (config) {
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
    };
    /**
     * Validates LLM model configuration
     * @throws Error if validation fails
     */
    ConfigValidator.validateLLMModel = function (model) {
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
    };
    // Utility validation methods
    ConfigValidator.validateNumberInRange = function (field, value, min, max) {
        if (value !== undefined) {
            if (typeof value !== 'number' || value < min || value > max) {
                throw new Error("".concat(field, " must be a number between ").concat(min, " and ").concat(max));
            }
        }
    };
    ConfigValidator.validatePositiveInteger = function (field, value) {
        if (value !== undefined) {
            if (!Number.isInteger(value) || value <= 0) {
                throw new Error("".concat(field, " must be a positive integer"));
            }
        }
    };
    ConfigValidator.validateStringArray = function (field, value) {
        if (value !== undefined) {
            if (!Array.isArray(value) || !value.every(function (item) { return typeof item === 'string'; })) {
                throw new Error("".concat(field, " must be an array of strings"));
            }
        }
    };
    ConfigValidator.validateRequiredString = function (field, value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new Error("".concat(field, " is required and must be a non-empty string"));
        }
    };
    ConfigValidator.validateEnumValue = function (field, value, validValues) {
        if (!validValues.includes(value)) {
            throw new Error("Invalid ".concat(field, ". Must be one of: ").concat(validValues.join(', ')));
        }
    };
    ConfigValidator.validateUrl = function (field, value) {
        try {
            new URL(value);
        }
        catch (_a) {
            throw new Error("".concat(field, " must be a valid URL"));
        }
    };
    ConfigValidator.validateEnvironmentVariables = function (env) {
        for (var _i = 0, _a = Object.entries(env); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (typeof key !== 'string' || key.trim().length === 0) {
                throw new Error('Environment variable keys must be non-empty strings');
            }
            if (typeof value !== 'string') {
                throw new Error('Environment variable values must be strings');
            }
        }
    };
    ConfigValidator.validatePricing = function (pricing) {
        if (pricing.input !== undefined) {
            this.validateNonNegativeNumber('pricing.input', pricing.input);
        }
        if (pricing.output !== undefined) {
            this.validateNonNegativeNumber('pricing.output', pricing.output);
        }
    };
    ConfigValidator.validateNonNegativeNumber = function (field, value) {
        if (typeof value !== 'number' || value < 0) {
            throw new Error("".concat(field, " must be a non-negative number"));
        }
    };
    ConfigValidator.VALID_FRAMEWORKS = ['cypress', 'playwright', 'puppeteer', 'selenium', 'testcafe', 'other'];
    ConfigValidator.VALID_BROWSERS = ['chrome', 'firefox', 'edge', 'safari'];
    ConfigValidator.VALID_PROVIDERS = ['ollama', 'lmstudio', 'huggingface'];
    return ConfigValidator;
}());
exports.ConfigValidator = ConfigValidator;
