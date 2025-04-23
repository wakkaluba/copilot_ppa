"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMOptionsValidator = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let LLMOptionsValidator = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var LLMOptionsValidator = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LLMOptionsValidator = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        outputChannel;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('LLM Options Validation');
        }
        validateRequestOptions(options) {
            const errors = [];
            const warnings = [];
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
                    const invalidSequences = options.stopSequences.filter(seq => typeof seq !== 'string');
                    if (invalidSequences.length > 0) {
                        errors.push('All stop sequences must be strings');
                    }
                }
            }
            // Stream option validation
            if (options.stream !== undefined && typeof options.stream !== 'boolean') {
                errors.push('stream must be a boolean value');
            }
            const result = {
                isValid: errors.length === 0,
                errors,
                warnings
            };
            this.logValidationResult(options, result);
            return result;
        }
        validateModelConfig(config) {
            const errors = [];
            const warnings = [];
            // Required fields
            const requiredFields = ['maxTokens', 'temperature'];
            for (const field of requiredFields) {
                if (config[field] === undefined) {
                    errors.push(`Missing required field: ${field}`);
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
            const result = {
                isValid: errors.length === 0,
                errors,
                warnings
            };
            this.logValidationResult(config, result);
            return result;
        }
        logValidationResult(input, result) {
            this.outputChannel.appendLine('\nValidation Result:');
            this.outputChannel.appendLine(`Valid: ${result.isValid}`);
            if (result.errors.length > 0) {
                this.outputChannel.appendLine('Errors:');
                result.errors.forEach(error => this.outputChannel.appendLine(`- ${error}`));
            }
            if (result.warnings.length > 0) {
                this.outputChannel.appendLine('Warnings:');
                result.warnings.forEach(warning => this.outputChannel.appendLine(`- ${warning}`));
            }
            this.outputChannel.appendLine('Input:');
            this.outputChannel.appendLine(JSON.stringify(input, null, 2));
        }
        handleError(error) {
            this.logger.error('[LLMOptionsValidator]', error);
            this.emit('error', error);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
        }
    };
    return LLMOptionsValidator = _classThis;
})();
exports.LLMOptionsValidator = LLMOptionsValidator;
//# sourceMappingURL=LLMOptionsValidator.js.map