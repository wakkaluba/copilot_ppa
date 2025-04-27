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
var config_1 = require("../config");
var llm_provider_1 = require("./llm-provider");
/**
 * Implementation of the LLMProvider interface for Ollama
 */
var OllamaProvider = /** @class */ (function (_super) {
    __extends(OllamaProvider, _super);
    function OllamaProvider(baseUrl) {
        if (baseUrl === void 0) { baseUrl = config_1.Config.ollamaApiUrl; }
        var _this = _super.call(this) || this;
        _this.name = 'Ollama';
        _this.modelDetails = new Map();
        _this.client = axios_1.default.create({
            baseURL: baseUrl,
            timeout: 30000
        });
        return _this;
    }
    OllamaProvider.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/api/tags')];
                    case 1:
                        _a.sent();
                        this.updateStatus({ isAvailable: true });
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        this.updateStatus({
                            isAvailable: false,
                            error: 'Failed to connect to Ollama service'
                        });
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var available;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isAvailable()];
                    case 1:
                        available = _a.sent();
                        if (!available) {
                            throw new llm_provider_1.LLMProviderError('CONNECTION_FAILED', 'Failed to connect to Ollama service');
                        }
                        this.updateStatus({ isConnected: true });
                        return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.updateStatus({ isConnected: false });
                return [2 /*return*/];
            });
        });
    };
    OllamaProvider.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, models, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.get('/api/tags')];
                    case 1:
                        response = _a.sent();
                        models = response.data.models || [];
                        return [2 /*return*/, Promise.all(models.map(function (model) { return __awaiter(_this, void 0, void 0, function () {
                                var info;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getModelInfo(model.name)];
                                        case 1:
                                            info = _a.sent();
                                            return [2 /*return*/, info];
                                    }
                                });
                            }); }))];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.handleError(error_2, 'FETCH_MODELS_FAILED')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.getModelInfo = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, response, modelInfo, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Check cache first
                        if (this.modelDetails.has(modelId)) {
                            cached = this.modelDetails.get(modelId);
                            return [2 /*return*/, this.convertModelInfo(modelId, cached)];
                        }
                        return [4 /*yield*/, this.client.post('/api/show', { name: modelId })];
                    case 1:
                        response = _a.sent();
                        modelInfo = response.data;
                        // Cache the response
                        this.modelDetails.set(modelId, modelInfo);
                        return [2 /*return*/, this.convertModelInfo(modelId, modelInfo)];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.handleError(error_3, 'FETCH_MODEL_INFO_FAILED')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.generateCompletion = function (model, prompt, systemPrompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, request, response, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!this.offlineMode) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.useCachedResponse(prompt)];
                    case 1:
                        cached = _a.sent();
                        if (cached) {
                            return [2 /*return*/, { content: cached }];
                        }
                        _a.label = 2;
                    case 2:
                        request = {
                            model: model,
                            prompt: prompt,
                            system: systemPrompt,
                            options: {
                                temperature: options === null || options === void 0 ? void 0 : options.temperature,
                                num_predict: options === null || options === void 0 ? void 0 : options.maxTokens,
                                top_p: options === null || options === void 0 ? void 0 : options.topP,
                                frequency_penalty: options === null || options === void 0 ? void 0 : options.frequencyPenalty,
                                presence_penalty: options === null || options === void 0 ? void 0 : options.presencePenalty,
                                stop: options === null || options === void 0 ? void 0 : options.stop
                            }
                        };
                        return [4 /*yield*/, this.client.post('/api/generate', request)];
                    case 3:
                        response = _a.sent();
                        result = {
                            content: response.data.response,
                            usage: {
                                promptTokens: response.data.prompt_eval_count || 0,
                                completionTokens: response.data.eval_count || 0,
                                totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                            }
                        };
                        if (!this.offlineMode) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.cacheResponse(prompt, result.content)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, result];
                    case 6:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.handleError(error_4, 'GENERATE_FAILED')];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.generateChatCompletion = function (model, messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        request = {
                            model: model,
                            messages: messages.map(function (msg) { return ({
                                role: msg.role,
                                content: msg.content
                            }); }),
                            options: {
                                temperature: options === null || options === void 0 ? void 0 : options.temperature,
                                num_predict: options === null || options === void 0 ? void 0 : options.maxTokens,
                                top_p: options === null || options === void 0 ? void 0 : options.topP,
                                frequency_penalty: options === null || options === void 0 ? void 0 : options.frequencyPenalty,
                                presence_penalty: options === null || options === void 0 ? void 0 : options.presencePenalty,
                                stop: options === null || options === void 0 ? void 0 : options.stop
                            }
                        };
                        return [4 /*yield*/, this.client.post('/api/chat', request)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, {
                                content: response.data.message.content,
                                usage: {
                                    promptTokens: response.data.prompt_eval_count || 0,
                                    completionTokens: response.data.eval_count || 0,
                                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                                }
                            }];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.handleError(error_5, 'CHAT_FAILED')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.streamCompletion = function (model, prompt, systemPrompt, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, _a, _b, _c, chunk, data, e_1_1, error_6;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 14, , 15]);
                        request = {
                            model: model,
                            prompt: prompt,
                            system: systemPrompt,
                            stream: true,
                            options: {
                                temperature: options === null || options === void 0 ? void 0 : options.temperature,
                                num_predict: options === null || options === void 0 ? void 0 : options.maxTokens,
                                top_p: options === null || options === void 0 ? void 0 : options.topP,
                                frequency_penalty: options === null || options === void 0 ? void 0 : options.frequencyPenalty,
                                presence_penalty: options === null || options === void 0 ? void 0 : options.presencePenalty,
                                stop: options === null || options === void 0 ? void 0 : options.stop
                            }
                        };
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
                                isComplete: data.done || false
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
                        error_6 = _g.sent();
                        this.handleError(error_6, 'STREAM_FAILED');
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.streamChatCompletion = function (model, messages, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response, _a, _b, _c, chunk, data, e_2_1, error_7;
            var _d, e_2, _e, _f;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 14, , 15]);
                        request = {
                            model: model,
                            messages: messages.map(function (msg) { return ({
                                role: msg.role,
                                content: msg.content
                            }); }),
                            stream: true,
                            options: {
                                temperature: options === null || options === void 0 ? void 0 : options.temperature,
                                num_predict: options === null || options === void 0 ? void 0 : options.maxTokens,
                                top_p: options === null || options === void 0 ? void 0 : options.topP,
                                frequency_penalty: options === null || options === void 0 ? void 0 : options.frequencyPenalty,
                                presence_penalty: options === null || options === void 0 ? void 0 : options.presencePenalty,
                                stop: options === null || options === void 0 ? void 0 : options.stop
                            }
                        };
                        return [4 /*yield*/, this.client.post('/api/chat', request, {
                                responseType: 'stream'
                            })];
                    case 1:
                        response = _h.sent();
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 7, 8, 13]);
                        _a = true, _b = __asyncValues(response.data);
                        _h.label = 3;
                    case 3: return [4 /*yield*/, _b.next()];
                    case 4:
                        if (!(_c = _h.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                        _f = _c.value;
                        _a = false;
                        chunk = _f;
                        data = JSON.parse(chunk.toString());
                        if (callback) {
                            callback({
                                content: ((_g = data.message) === null || _g === void 0 ? void 0 : _g.content) || '',
                                isComplete: data.done || false
                            });
                        }
                        _h.label = 5;
                    case 5:
                        _a = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_2_1 = _h.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _h.trys.push([8, , 11, 12]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _e.call(_b)];
                    case 9:
                        _h.sent();
                        _h.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        error_7 = _h.sent();
                        this.handleError(error_7, 'STREAM_CHAT_FAILED');
                        return [3 /*break*/, 15];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    OllamaProvider.prototype.convertModelInfo = function (modelId, info) {
        var _a, _b, _c;
        return {
            id: modelId,
            name: info.name,
            provider: 'ollama',
            capabilities: ((_a = info.details) === null || _a === void 0 ? void 0 : _a.capabilities) || [],
            parameters: this.parseParameterSize((_b = info.details) === null || _b === void 0 ? void 0 : _b.parameter_size),
            contextLength: 4096, // Default for most Ollama models
            quantization: (_c = info.details) === null || _c === void 0 ? void 0 : _c.quantization_level,
            license: info.license
        };
    };
    OllamaProvider.prototype.parseParameterSize = function (size) {
        if (!size) {
            return undefined;
        }
        var match = size.match(/(\d+)([BM])/);
        if (!match) {
            return undefined;
        }
        var num = match[1], unit = match[2];
        return unit === 'B' ? parseInt(num) : parseInt(num) / 1000;
    };
    return OllamaProvider;
}(llm_provider_1.BaseLLMProvider));
exports.OllamaProvider = OllamaProvider;
