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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
var axios_1 = require("axios");
var BaseLLMProvider_1 = require("./BaseLLMProvider");
var errors_1 = require("../errors");
var OllamaProvider = /** @class */ (function (_super) {
    __extends(OllamaProvider, _super);
    function OllamaProvider(config) {
        var _this = _super.call(this, 'ollama', 'Ollama', config) || this;
        _this.modelDetails = new Map();
        _this.client = axios_1.default.create({
            baseURL: config.apiEndpoint,
            timeout: config.requestTimeout || 30000
        });
        return _this;
    }
    OllamaProvider.prototype.performHealthCheck = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, endTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        startTime = Date.now();
                        return [4 /*yield*/, this.client.get('/api/health')];
                    case 1:
                        _a.sent();
                        endTime = Date.now();
                        return [2 /*return*/, {
                                isHealthy: true,
                                latency: endTime - startTime,
                                timestamp: endTime
                            }];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, {
                                isHealthy: false,
                                error: error_1 instanceof Error ? error_1 : new Error(String(error_1)),
                                latency: 0,
                                timestamp: new Date()
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/api/health')];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var available, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.validateConfig();
                        this.setState(BaseLLMProvider_1.ProviderState.Initializing);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.isAvailable()];
                    case 2:
                        available = _a.sent();
                        if (!available) {
                            throw new errors_1.ProviderError('Ollama service is not available', this.id);
                        }
                        return [4 /*yield*/, this.refreshModels()];
                    case 3:
                        _a.sent();
                        this.setState(BaseLLMProvider_1.ProviderState.Active);
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        this.setError(error_2 instanceof Error ? error_2 : new Error(String(error_2)));
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.setState(BaseLLMProvider_1.ProviderState.Deactivating);
                this.modelDetails.clear();
                this.setState(BaseLLMProvider_1.ProviderState.Inactive);
                return [2 /*return*/];
            });
        });
    };
    OllamaProvider.prototype.refreshModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, models, _i, models_1, model, error_3, errorString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/api/tags')];
                    case 1:
                        response = _a.sent();
                        models = response.data.models || [];
                        this.modelDetails.clear();
                        for (_i = 0, models_1 = models; _i < models_1.length; _i++) {
                            model = models_1[_i];
                            this.modelDetails.set(model.name, model);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        errorString = error_3 instanceof Error ? error_3.message : String(error_3);
                        throw new errors_1.ProviderError('Failed to fetch models', this.id, errorString);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.refreshModels()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Array.from(this.modelDetails.entries()).map(function (_a) {
                                var id = _a[0], info = _a[1];
                                return _this.convertModelInfo(id, info);
                            })];
                }
            });
        });
    };
    OllamaProvider.prototype.getModelInfo = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var info;
            return __generator(this, function (_a) {
                info = this.modelDetails.get(modelId);
                if (!info) {
                    throw new errors_1.ModelError('Model not found', this.id, modelId);
                }
                return [2 /*return*/, this.convertModelInfo(modelId, info)];
            });
        });
    };
    OllamaProvider.prototype.getCapabilities = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        maxContextLength: 4096,
                        supportsChatCompletion: true,
                        supportsStreaming: true,
                        supportsSystemPrompts: true
                    }];
            });
        });
    };
    OllamaProvider.prototype.generateCompletion = function (model, prompt, systemPrompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        request = __assign(__assign({ model: model, prompt: prompt }, (systemPrompt && { system: systemPrompt })), (options && {
                            options: __assign(__assign(__assign(__assign(__assign(__assign({}, (options.temperature !== undefined && { temperature: options.temperature })), (options.maxTokens !== undefined && { num_predict: options.maxTokens })), (options.topK !== undefined && { top_k: options.topK })), (options.presenceBonus !== undefined && { presence_penalty: options.presenceBonus })), (options.frequencyBonus !== undefined && { frequency_penalty: options.frequencyBonus })), (options.stopSequences !== undefined && { stop: options.stopSequences }))
                        }));
                        return [4 /*yield*/, this.client.post('/api/generate', request)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                content: response.data.response,
                                usage: {
                                    promptTokens: response.data.prompt_eval_count || 0,
                                    completionTokens: response.data.eval_count || 0,
                                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                                }
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new errors_1.RequestError('Generation failed', this.id, error_4 instanceof Error ? error_4 : new Error(String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.generateChatCompletion = function (model, messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                prompt = this.formatChatMessages(messages);
                return [2 /*return*/, this.generateCompletion(model, prompt, undefined, options)];
            });
        });
    };
    OllamaProvider.prototype.streamCompletion = function (model, prompt, systemPrompt, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, _a, _b, _c, chunk, data, e_1_1, error_5;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 14, , 15]);
                        request = __assign(__assign({ model: model, prompt: prompt }, (systemPrompt && { system: systemPrompt })), (options && {
                            options: __assign(__assign(__assign(__assign(__assign(__assign({}, (options.temperature !== undefined && { temperature: options.temperature })), (options.maxTokens !== undefined && { num_predict: options.maxTokens })), (options.topK !== undefined && { top_k: options.topK })), (options.presenceBonus !== undefined && { presence_penalty: options.presenceBonus })), (options.frequencyBonus !== undefined && { frequency_penalty: options.frequencyBonus })), (options.stopSequences !== undefined && { stop: options.stopSequences }))
                        }));
                        return [4 /*yield*/, this.client.post('/api/generate', request, {
                                responseType: 'stream'
                            })];
                    case 1:
                        response = _g.sent();
                        _g.label = 2;
                    case 2:
                        _g.trys.push([2, 7, 8, 13]);
                        _a = true, _b = __asyncValues(response.data);
                        _g.label = 3;
                    case 3: return [4 /*yield*/, _b.next()];
                    case 4:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                        _f = _c.value;
                        _a = false;
                        chunk = _f;
                        data = JSON.parse(chunk.toString());
                        if (callback) {
                            callback({
                                content: data.response,
                                done: data.done
                            });
                        }
                        _g.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _g.trys.push([8, , 11, 12]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _e.call(_b)];
                    case 9:
                        _g.sent();
                        _g.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        error_5 = _g.sent();
                        throw new errors_1.RequestError('Streaming failed', this.id, error_5 instanceof Error ? error_5 : new Error(String(error_5)));
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.streamChatCompletion = function (model, messages, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = this.formatChatMessages(messages);
                        return [4 /*yield*/, this.streamCompletion(model, prompt, undefined, options, callback)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.convertModelInfo = function (modelId, info) {
        return {
            id: modelId,
            name: info.name,
            provider: this.id,
            maxContextLength: 4096, // Default for most Ollama models
            parameters: {
                format: info.details.format,
                family: info.details.family,
                size: this.parseParameterSize(info.details.parameter_size)
            },
            features: info.details.capabilities || [],
            metadata: {
                quantization: info.details.quantization_level,
                license: info.license
            }
        };
    };
    OllamaProvider.prototype.parseParameterSize = function (size) {
        if (!size)
            return undefined;
        var match = size.match(/(\d+)([BM])/);
        if (!match)
            return undefined;
        var num = match[1], unit = match[2];
        if (!num)
            return undefined;
        return unit === 'B' ? parseInt(num, 10) : parseInt(num, 10) / 1000;
    };
    OllamaProvider.prototype.formatChatMessages = function (messages) {
        return messages.map(function (msg) {
            return "".concat(msg.role === 'assistant' ? 'Assistant' : 'User', ": ").concat(msg.content);
        }).join('\n');
    };
    return OllamaProvider;
}(BaseLLMProvider_1.BaseLLMProvider));
exports.OllamaProvider = OllamaProvider;
