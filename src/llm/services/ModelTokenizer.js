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
exports.ModelTokenizer = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelTokenizer = /** @class */ (function (_super) {
    __extends(ModelTokenizer, _super);
    function ModelTokenizer(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.cache = new Map();
        _this.maxCacheSize = 1000;
        _this.outputChannel = vscode.window.createOutputChannel('Model Tokenization');
        return _this;
    }
    ModelTokenizer.prototype.countTokens = function (text_1) {
        return __awaiter(this, arguments, void 0, function (text, options) {
            var result, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.tokenize(text, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.tokenCount];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError(error_1);
                        return [2 /*return*/, 0];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelTokenizer.prototype.tokenize = function (text_1) {
        return __awaiter(this, arguments, void 0, function (text, options) {
            var cacheKey, cached, tokens, result;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                try {
                    cacheKey = this.getCacheKey(text, options);
                    cached = this.cache.get(cacheKey);
                    if (cached) {
                        return [2 /*return*/, cached];
                    }
                    tokens = this.performTokenization(text, options);
                    result = {
                        tokens: tokens,
                        tokenCount: tokens.length,
                        text: text,
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
                    return [2 /*return*/, result];
                }
                catch (error) {
                    this.handleError(error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelTokenizer.prototype.performTokenization = function (text, options) {
        // Basic whitespace and punctuation tokenization as fallback
        // In practice, this would be replaced by model-specific tokenizers
        var tokens = text
            .replace(/([.,!?;:])/g, ' $1 ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(Boolean);
        if (options.preserveWhitespace) {
            var whitespaceTokens = text.match(/\s+/g) || [];
            tokens.push.apply(tokens, whitespaceTokens);
        }
        return tokens;
    };
    ModelTokenizer.prototype.truncateTokens = function (tokens, maxTokens) {
        if (tokens.length <= maxTokens) {
            return tokens;
        }
        // If preserving complete sentences is enabled
        if (this.shouldPreserveCompleteSentences(tokens)) {
            return this.truncateToCompleteSentence(tokens, maxTokens);
        }
        return tokens.slice(0, maxTokens);
    };
    ModelTokenizer.prototype.shouldPreserveCompleteSentences = function (tokens) {
        // Check if tokens form complete sentences worth preserving
        var endMarkers = new Set(['.', '!', '?']);
        return tokens.some(function (token) { return endMarkers.has(token); });
    };
    ModelTokenizer.prototype.truncateToCompleteSentence = function (tokens, maxTokens) {
        var lastSentenceEnd = 0;
        var endMarkers = new Set(['.', '!', '?']);
        for (var i = 0; i < Math.min(tokens.length, maxTokens); i++) {
            if (endMarkers.has(tokens[i])) {
                lastSentenceEnd = i + 1;
            }
        }
        return tokens.slice(0, lastSentenceEnd || maxTokens);
    };
    ModelTokenizer.prototype.getCacheKey = function (text, options) {
        return "".concat(text, ":").concat(JSON.stringify(options));
    };
    ModelTokenizer.prototype.maintainCache = function () {
        if (this.cache.size > this.maxCacheSize) {
            var entries = Array.from(this.cache.entries());
            entries.sort(function (a, b) { return a[1].metadata.timestamp - b[1].metadata.timestamp; });
            while (this.cache.size > this.maxCacheSize * 0.8) {
                var key = (entries.shift() || [])[0];
                if (key) {
                    this.cache.delete(key);
                }
            }
        }
    };
    ModelTokenizer.prototype.logTokenizationResult = function (result) {
        this.outputChannel.appendLine('\nTokenization Result:');
        this.outputChannel.appendLine("Total tokens: ".concat(result.tokenCount));
        this.outputChannel.appendLine("Truncated: ".concat(result.metadata.truncated));
        if (result.metadata.modelId) {
            this.outputChannel.appendLine("Model: ".concat(result.metadata.modelId));
        }
        this.outputChannel.appendLine("Timestamp: ".concat(new Date(result.metadata.timestamp).toISOString()));
    };
    ModelTokenizer.prototype.handleError = function (error) {
        this.logger.error('[ModelTokenizer]', error);
        this.emit('error', error);
    };
    ModelTokenizer.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.cache.clear();
    };
    var _a;
    ModelTokenizer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
    ], ModelTokenizer);
    return ModelTokenizer;
}(events_1.EventEmitter));
exports.ModelTokenizer = ModelTokenizer;
