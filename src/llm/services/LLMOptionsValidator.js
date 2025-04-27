"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMOptionsValidator = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var LLMOptionsValidator = /** @class */ (function (_super) {
    __extends(LLMOptionsValidator, _super);
    function LLMOptionsValidator(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.outputChannel = vscode.window.createOutputChannel('LLM Options Validation');
        return _this;
    }
    LLMOptionsValidator.prototype.validateRequestOptions = function (options) {
        var errors = [];
        var warnings = [];
        // Temperature validation
        if (options.temperature !== undefined) {
            if (typeof options.temperature !== 'number') {
                errors.push('Temperature must be a number');
            }
            else if (options.temperature < 0 || options.temperature > 2) {
                errors.push('Temperature must be between 0 and 2');
            }
            else if (options.temperature > 1) {
                warnings.push('Temperature > 1 may lead to very random outputs');
            }
        }
        // Max tokens validation
        if (options.maxTokens !== undefined) {
            if (typeof options.maxTokens !== 'number') {
                errors.push('maxTokens must be a number');
            }
            else if (!Number.isInteger(options.maxTokens)) {
                errors.push('maxTokens must be an integer');
            }
            else if (options.maxTokens < 1) {
                errors.push('maxTokens must be positive');
            }
            else if (options.maxTokens > 32000) {
                errors.push('maxTokens exceeds maximum allowed value of 32000');
            }
        }
        // Top P validation
        if (options.topP !== undefined) {
            if (typeof options.topP !== 'number') {
                errors.push('topP must be a number');
            }
            else if (options.topP < 0 || options.topP > 1) {
                errors.push('topP must be between 0 and 1');
            }
        }
        // Presence penalty validation
        if (options.presencePenalty !== undefined) {
            if (typeof options.presencePenalty !== 'number') {
                errors.push('presencePenalty must be a number');
            }
            else if (options.presencePenalty < -2 || options.presencePenalty > 2) {
                errors.push('presencePenalty must be between -2 and 2');
            }
        }
        // Frequency penalty validation
        if (options.frequencyPenalty !== undefined) {
            if (typeof options.frequencyPenalty !== 'number') {
                errors.push('frequencyPenalty must be a number');
            }
            else if (options.frequencyPenalty < -2 || options.frequencyPenalty > 2) {
                errors.push('frequencyPenalty must be between -2 and 2');
            }
        }
        // Stop sequences validation
        if (options.stopSequences !== undefined) {
            if (!Array.isArray(options.stopSequences)) {
                errors.push('stopSequences must be an array');
            }
            else {
                var invalidSequences = options.stopSequences.filter(function (seq) { return typeof seq !== 'string'; });
                if (invalidSequences.length > 0) {
                    errors.push('All stop sequences must be strings');
                }
            }
        }
        // Stream option validation
        if (options.stream !== undefined && typeof options.stream !== 'boolean') {
            errors.push('stream must be a boolean value');
        }
        var result = {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
        this.logValidationResult(options, result);
        return result;
    };
    LLMOptionsValidator.prototype.validateModelConfig = function (config) {
        var errors = [];
        var warnings = [];
        // Required fields
        var requiredFields = ['maxTokens', 'temperature'];
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            if (config[field] === undefined) {
                errors.push("Missing required field: ".concat(field));
            }
        }
        // Batch size validation
        if (config.batchSize !== undefined) {
            if (!Number.isInteger(config.batchSize)) {
                errors.push('batchSize must be an integer');
            }
            else if (config.batchSize < 1) {
                errors.push('batchSize must be positive');
            }
            else if (config.batchSize > 64) {
                warnings.push('Large batch size may impact performance');
            }
        }
        // Context length validation
        if (config.contextLength !== undefined) {
            if (!Number.isInteger(config.contextLength)) {
                errors.push('contextLength must be an integer');
            }
            else if (config.contextLength < 1) {
                errors.push('contextLength must be positive');
            }
            else if (config.contextLength > 32000) {
                errors.push('contextLength exceeds maximum allowed value');
            }
        }
        // Seed validation
        if (config.seed !== undefined) {
            if (!Number.isInteger(config.seed)) {
                errors.push('seed must be an integer');
            }
            else if (config.seed < 0) {
                errors.push('seed must be non-negative');
            }
        }
        var result = {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings
        };
        this.logValidationResult(config, result);
        return result;
    };
    LLMOptionsValidator.prototype.logValidationResult = function (input, result) {
        var _this = this;
        this.outputChannel.appendLine('\nValidation Result:');
        this.outputChannel.appendLine("Valid: ".concat(result.isValid));
        if (result.errors.length > 0) {
            this.outputChannel.appendLine('Errors:');
            result.errors.forEach(function (error) { return _this.outputChannel.appendLine("- ".concat(error)); });
        }
        if (result.warnings.length > 0) {
            this.outputChannel.appendLine('Warnings:');
            result.warnings.forEach(function (warning) { return _this.outputChannel.appendLine("- ".concat(warning)); });
        }
        this.outputChannel.appendLine('Input:');
        this.outputChannel.appendLine(JSON.stringify(input, null, 2));
    };
    LLMOptionsValidator.prototype.handleError = function (error) {
        this.logger.error('[LLMOptionsValidator]', error);
        this.emit('error', error);
    };
    LLMOptionsValidator.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
    };
    var _a;
    LLMOptionsValidator = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
    ], LLMOptionsValidator);
    return LLMOptionsValidator;
}(events_1.EventEmitter));
exports.LLMOptionsValidator = LLMOptionsValidator;
