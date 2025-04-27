"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderValidator = void 0;
var LLMProviderValidator = /** @class */ (function () {
    function LLMProviderValidator() {
    }
    LLMProviderValidator.prototype.validateConfig = function (config) {
        var errors = [];
        // Check required fields
        for (var _i = 0, _a = LLMProviderValidator.REQUIRED_CONFIG_FIELDS; _i < _a.length; _i++) {
            var field = _a[_i];
            if (!config[field]) {
                errors.push("Missing required field: ".concat(field));
            }
        }
        // Validate connection config
        if (config.connection) {
            if (typeof config.connection.timeout !== 'number' || config.connection.timeout <= 0) {
                errors.push('Connection timeout must be a positive number');
            }
            if (config.connection.poolSize !== undefined) {
                if (typeof config.connection.poolSize !== 'number' ||
                    config.connection.poolSize < 1 ||
                    config.connection.poolSize > 20) {
                    errors.push('Connection pool size must be between 1 and 20');
                }
            }
            if (config.connection.retryAttempts !== undefined) {
                if (typeof config.connection.retryAttempts !== 'number' ||
                    config.connection.retryAttempts < 0) {
                    errors.push('Retry attempts must be a non-negative number');
                }
            }
        }
        // Validate API endpoint
        try {
            new URL(config.apiEndpoint);
        }
        catch (_b) {
            errors.push('Invalid API endpoint URL');
        }
        // Validate authentication if provided
        if (config.authentication) {
            if (!config.authentication.type) {
                errors.push('Authentication type is required when authentication is provided');
            }
            switch (config.authentication.type) {
                case 'apiKey':
                    if (!config.authentication.apiKey) {
                        errors.push('API key is required for apiKey authentication');
                    }
                    break;
                case 'bearer':
                    if (!config.authentication.token) {
                        errors.push('Token is required for bearer authentication');
                    }
                    break;
                case 'basic':
                    if (!config.authentication.username || !config.authentication.password) {
                        errors.push('Username and password are required for basic authentication');
                    }
                    break;
                default:
                    errors.push("Unsupported authentication type: ".concat(config.authentication.type));
            }
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    LLMProviderValidator.prototype.validateHealth = function (result) {
        var errors = [];
        if (typeof result.isHealthy !== 'boolean') {
            errors.push('Health check must return a boolean isHealthy status');
        }
        if (typeof result.latency !== 'number' || result.latency < 0) {
            errors.push('Health check latency must be a non-negative number');
        }
        if (typeof result.timestamp !== 'number' || result.timestamp < 0) {
            errors.push('Health check timestamp must be a non-negative number');
        }
        if (!result.isHealthy && !result.error) {
            errors.push('Unhealthy status must include an error description');
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    LLMProviderValidator.prototype.validateProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, requiredMethods, _i, requiredMethods_1, method, capabilities, health, healthValidation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        requiredMethods = [
                            'connect',
                            'disconnect',
                            'healthCheck',
                            'generateCompletion',
                            'generateChatCompletion'
                        ];
                        for (_i = 0, requiredMethods_1 = requiredMethods; _i < requiredMethods_1.length; _i++) {
                            method = requiredMethods_1[_i];
                            if (typeof provider[method] !== 'function') {
                                errors.push("Provider must implement ".concat(method, " method"));
                            }
                        }
                        // Validate provider ID
                        if (!provider.id || typeof provider.id !== 'string') {
                            errors.push('Provider must have a valid string ID');
                        }
                        return [4 /*yield*/, provider.getCapabilities()];
                    case 2:
                        capabilities = _a.sent();
                        if (!capabilities) {
                            errors.push('Provider must return capabilities');
                        }
                        else {
                            if (!Array.isArray(capabilities.supportedModels)) {
                                errors.push('Provider capabilities must include supportedModels array');
                            }
                            if (typeof capabilities.supportsStreaming !== 'boolean') {
                                errors.push('Provider capabilities must specify supportsStreaming');
                            }
                        }
                        return [4 /*yield*/, provider.healthCheck()];
                    case 3:
                        health = _a.sent();
                        healthValidation = this.validateHealth(health);
                        if (!healthValidation.isValid) {
                            errors.push.apply(errors, healthValidation.errors);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        errors.push("Provider validation failed: ".concat(error_1.message));
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, {
                            isValid: errors.length === 0,
                            errors: errors
                        }];
                }
            });
        });
    };
    LLMProviderValidator.prototype.validateResponse = function (response) {
        var errors = [];
        if (!response) {
            errors.push('Response cannot be null or undefined');
            return { isValid: false, errors: errors };
        }
        if (typeof response.content !== 'string' || response.content.length === 0) {
            errors.push('Response must contain non-empty content string');
        }
        if (response.usage) {
            var _a = response.usage, promptTokens = _a.promptTokens, completionTokens = _a.completionTokens, totalTokens = _a.totalTokens;
            if (!Number.isInteger(promptTokens) || promptTokens < 0) {
                errors.push('promptTokens must be a non-negative integer');
            }
            if (!Number.isInteger(completionTokens) || completionTokens < 0) {
                errors.push('completionTokens must be a non-negative integer');
            }
            if (!Number.isInteger(totalTokens) || totalTokens < 0) {
                errors.push('totalTokens must be a non-negative integer');
            }
            if (totalTokens !== (promptTokens + completionTokens)) {
                errors.push('totalTokens must equal promptTokens + completionTokens');
            }
        }
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };
    LLMProviderValidator.REQUIRED_CONFIG_FIELDS = [
        'apiEndpoint',
        'connection'
    ];
    return LLMProviderValidator;
}());
exports.LLMProviderValidator = LLMProviderValidator;
