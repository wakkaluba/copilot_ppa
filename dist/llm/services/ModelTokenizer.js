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
exports.ModelTokenizer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelTokenizer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelTokenizer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelTokenizer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        outputChannel;
        cache = new Map();
        maxCacheSize = 1000;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Tokenization');
        }
        async countTokens(text, options = {}) {
            try {
                const result = await this.tokenize(text, options);
                return result.tokenCount;
            }
            catch (error) {
                this.handleError(error);
                return 0;
            }
        }
        async tokenize(text, options = {}) {
            try {
                const cacheKey = this.getCacheKey(text, options);
                const cached = this.cache.get(cacheKey);
                if (cached) {
                    return cached;
                }
                const tokens = this.performTokenization(text, options);
                const result = {
                    tokens,
                    tokenCount: tokens.length,
                    text,
                    metadata: {
                        timestamp: Date.now(),
                        modelId: options.modelId,
                        truncated: false
                    }
                };
                if (options.maxTokens && result.tokenCount > options.maxTokens) {
                    result.tokens = this.truncateTokens(result.tokens, options.maxTokens);
                    result.tokenCount = result.tokens.length;
                    result.metadata.truncated = true;
                }
                this.cache.set(cacheKey, result);
                this.maintainCache();
                this.logTokenizationResult(result);
                return result;
            }
            catch (error) {
                this.handleError(error);
                throw error;
            }
        }
        performTokenization(text, options) {
            // Basic whitespace and punctuation tokenization as fallback
            // In practice, this would be replaced by model-specific tokenizers
            const tokens = text
                .replace(/([.,!?;:])/g, ' $1 ')
                .replace(/\s+/g, ' ')
                .trim()
                .split(' ')
                .filter(Boolean);
            if (options.preserveWhitespace) {
                const whitespaceTokens = text.match(/\s+/g) || [];
                tokens.push(...whitespaceTokens);
            }
            return tokens;
        }
        truncateTokens(tokens, maxTokens) {
            if (tokens.length <= maxTokens) {
                return tokens;
            }
            // If preserving complete sentences is enabled
            if (this.shouldPreserveCompleteSentences(tokens)) {
                return this.truncateToCompleteSentence(tokens, maxTokens);
            }
            return tokens.slice(0, maxTokens);
        }
        shouldPreserveCompleteSentences(tokens) {
            // Check if tokens form complete sentences worth preserving
            const endMarkers = new Set(['.', '!', '?']);
            return tokens.some(token => endMarkers.has(token));
        }
        truncateToCompleteSentence(tokens, maxTokens) {
            let lastSentenceEnd = 0;
            const endMarkers = new Set(['.', '!', '?']);
            for (let i = 0; i < Math.min(tokens.length, maxTokens); i++) {
                if (endMarkers.has(tokens[i])) {
                    lastSentenceEnd = i + 1;
                }
            }
            return tokens.slice(0, lastSentenceEnd || maxTokens);
        }
        getCacheKey(text, options) {
            return `${text}:${JSON.stringify(options)}`;
        }
        maintainCache() {
            if (this.cache.size > this.maxCacheSize) {
                const entries = Array.from(this.cache.entries());
                entries.sort((a, b) => a[1].metadata.timestamp - b[1].metadata.timestamp);
                while (this.cache.size > this.maxCacheSize * 0.8) {
                    const [key] = entries.shift() || [];
                    if (key) {
                        this.cache.delete(key);
                    }
                }
            }
        }
        logTokenizationResult(result) {
            this.outputChannel.appendLine('\nTokenization Result:');
            this.outputChannel.appendLine(`Total tokens: ${result.tokenCount}`);
            this.outputChannel.appendLine(`Truncated: ${result.metadata.truncated}`);
            if (result.metadata.modelId) {
                this.outputChannel.appendLine(`Model: ${result.metadata.modelId}`);
            }
            this.outputChannel.appendLine(`Timestamp: ${new Date(result.metadata.timestamp).toISOString()}`);
        }
        handleError(error) {
            this.logger.error('[ModelTokenizer]', error);
            this.emit('error', error);
        }
        dispose() {
            this.outputChannel.dispose();
            this.removeAllListeners();
            this.cache.clear();
        }
    };
    return ModelTokenizer = _classThis;
})();
exports.ModelTokenizer = ModelTokenizer;
//# sourceMappingURL=ModelTokenizer.js.map