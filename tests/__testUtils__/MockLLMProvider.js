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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.MockLLMProvider = void 0;
var events_1 = require("events");
/**
 * Mock LLM Provider for testing purposes
 */
var MockLLMProvider = /** @class */ (function (_super) {
    __extends(MockLLMProvider, _super);
    function MockLLMProvider(name) {
        if (name === void 0) { name = 'MockProvider'; }
        var _this = _super.call(this) || this;
        _this._status = {
            isConnected: false,
            activeModel: null,
            modelInfo: null,
            error: null
        };
        _this._offlineMode = false;
        _this._lastResponse = null;
        _this._cachedResponses = new Map();
        _this.name = name;
        return _this;
    }
    MockLLMProvider.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, true];
            });
        });
    };
    MockLLMProvider.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._status.isConnected = true;
                this.emit('stateChanged', this.getStatus());
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    MockLLMProvider.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._status.isConnected = false;
                this.emit('stateChanged', this.getStatus());
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    MockLLMProvider.prototype.getStatus = function () {
        return __assign({}, this._status);
    };
    MockLLMProvider.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, [
                        { id: 'model1', name: 'Model 1', provider: this.name, parameter_size: '7B' },
                        { id: 'model2', name: 'Model 2', provider: this.name, parameter_size: '13B' }
                    ]];
            });
        });
    };
    MockLLMProvider.prototype.getModelInfo = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        id: modelId,
                        name: "Model ".concat(modelId),
                        provider: this.name,
                        parameter_size: '7B'
                    }];
            });
        });
    };
    MockLLMProvider.prototype.generateCompletion = function (model, prompt, systemPrompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._offlineMode) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.useCachedResponse(prompt)];
                    case 1:
                        cached = _a.sent();
                        if (cached) {
                            return [2 /*return*/, { content: cached }];
                        }
                        if (this._lastResponse) {
                            return [2 /*return*/, { content: this._lastResponse }];
                        }
                        return [2 /*return*/, { content: "Offline mode - no cached response available" }];
                    case 2:
                        response = "Mock response for: ".concat(prompt).concat(systemPrompt ? ' (with system prompt)' : '');
                        this._lastResponse = response;
                        return [4 /*yield*/, this.cacheResponse(prompt, response)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, {
                                content: response,
                                usage: {
                                    promptTokens: prompt.length,
                                    completionTokens: response.length,
                                    totalTokens: prompt.length + response.length
                                }
                            }];
                }
            });
        });
    };
    MockLLMProvider.prototype.generateChatCompletion = function (model, messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, systemMessage;
            return __generator(this, function (_a) {
                prompt = messages.map(function (m) { return "".concat(m.role, ": ").concat(m.content); }).join('\n');
                systemMessage = messages.find(function (m) { return m.role === 'system'; });
                return [2 /*return*/, this.generateCompletion(model, prompt, systemMessage === null || systemMessage === void 0 ? void 0 : systemMessage.content, options)];
            });
        });
    };
    MockLLMProvider.prototype.streamCompletion = function (model, prompt, systemPrompt, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var words, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!callback) {
                            return [2 /*return*/];
                        }
                        words = "Mock response for: ".concat(prompt).split(' ');
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < words.length)) return [3 /*break*/, 4];
                        callback({
                            content: words[i] + (i < words.length - 1 ? ' ' : ''),
                            done: i === words.length - 1
                        });
                        // Short delay to simulate streaming
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5); })];
                    case 2:
                        // Short delay to simulate streaming
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MockLLMProvider.prototype.streamChatCompletion = function (model, messages, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, systemMessage;
            return __generator(this, function (_a) {
                prompt = messages.map(function (m) { return "".concat(m.role, ": ").concat(m.content); }).join('\n');
                systemMessage = messages.find(function (m) { return m.role === 'system'; });
                return [2 /*return*/, this.streamCompletion(model, prompt, systemMessage === null || systemMessage === void 0 ? void 0 : systemMessage.content, options, callback)];
            });
        });
    };
    MockLLMProvider.prototype.setOfflineMode = function (enabled) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._offlineMode = enabled;
                return [2 /*return*/];
            });
        });
    };
    MockLLMProvider.prototype.useCachedResponse = function (prompt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._cachedResponses.get(prompt) || null];
            });
        });
    };
    MockLLMProvider.prototype.cacheResponse = function (prompt, response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._cachedResponses.set(prompt, response);
                return [2 /*return*/];
            });
        });
    };
    MockLLMProvider.prototype.getLastResponse = function () {
        return this._lastResponse;
    };
    return MockLLMProvider;
}(events_1.EventEmitter));
exports.MockLLMProvider = MockLLMProvider;
