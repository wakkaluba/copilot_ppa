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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTokenizer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
let ModelTokenizer = class ModelTokenizer extends events_1.EventEmitter {
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
                    timestamp: new Date(),
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
exports.ModelTokenizer = ModelTokenizer;
exports.ModelTokenizer = ModelTokenizer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
], ModelTokenizer);
//# sourceMappingURL=ModelTokenizer.js.map