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
exports.LMStudioProvider = void 0;
var axios_1 = require("axios");
var config_1 = require("../config");
/**
 * Implementation of LLMProvider for LM Studio's OpenAI-compatible API
 */
var LMStudioProvider = /** @class */ (function () {
    function LMStudioProvider(baseUrl) {
        if (baseUrl === void 0) { baseUrl = config_1.Config.lmStudioApiUrl; }
        this.name = 'LM Studio';
        this.baseUrl = baseUrl;
    }
    /**
     * Check if LM Studio is available
     */
    LMStudioProvider.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/models"))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        console.error('LM Studio not available:', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get available models from LM Studio
     */
    LMStudioProvider.prototype.getAvailableModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.baseUrl, "/models"))];
                    case 1:
                        response = _a.sent();
                        if (response.data && response.data.data) {
                            return [2 /*return*/, response.data.data.map(function (model) { return model.id; })];
                        }
                        return [2 /*return*/, ['local-model']]; // Default fallback if no models reported
                    case 2:
                        error_2 = _a.sent();
                        console.error('Failed to get LM Studio models:', error_2);
                        return [2 /*return*/, ['local-model']]; // Default fallback on error
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate text completion using LM Studio
     */
    LMStudioProvider.prototype.generateCompletion = function (model, prompt, systemPrompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, request, response, openAIResponse, error_3;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        // For LM Studio, we'll use chat completions API with system+user messages
                        // as it provides better control than the plain completions API
                        if (systemPrompt) {
                            messages = [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: prompt }
                            ];
                            return [2 /*return*/, this.generateChatCompletion(model, messages.map(function (m) { return ({
                                    role: m.role,
                                    content: m.content
                                }); }), options)];
                        }
                        request = {
                            model: model,
                            prompt: prompt,
                            temperature: options === null || options === void 0 ? void 0 : options.temperature,
                            max_tokens: options === null || options === void 0 ? void 0 : options.maxTokens,
                            stream: false
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/completions"), request, { headers: { 'Content-Type': 'application/json' } })];
                    case 2:
                        response = _d.sent();
                        openAIResponse = response.data;
                        return [2 /*return*/, {
                                content: openAIResponse.choices[0].text,
                                usage: {
                                    promptTokens: (_a = openAIResponse.usage) === null || _a === void 0 ? void 0 : _a.prompt_tokens,
                                    completionTokens: (_b = openAIResponse.usage) === null || _b === void 0 ? void 0 : _b.completion_tokens,
                                    totalTokens: (_c = openAIResponse.usage) === null || _c === void 0 ? void 0 : _c.total_tokens
                                }
                            }];
                    case 3:
                        error_3 = _d.sent();
                        console.error('LM Studio completion error:', error_3);
                        throw new Error("Failed to generate completion: ".concat(error_3));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate chat completion using LM Studio
     */
    LMStudioProvider.prototype.generateChatCompletion = function (model, messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var openAIMessages, request, response, openAIResponse, error_4;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        openAIMessages = messages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        request = {
                            model: model,
                            messages: openAIMessages,
                            temperature: options === null || options === void 0 ? void 0 : options.temperature,
                            max_tokens: options === null || options === void 0 ? void 0 : options.maxTokens,
                            stream: false
                        };
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/chat/completions"), request, { headers: { 'Content-Type': 'application/json' } })];
                    case 2:
                        response = _d.sent();
                        openAIResponse = response.data;
                        return [2 /*return*/, {
                                content: openAIResponse.choices[0].message.content,
                                usage: {
                                    promptTokens: (_a = openAIResponse.usage) === null || _a === void 0 ? void 0 : _a.prompt_tokens,
                                    completionTokens: (_b = openAIResponse.usage) === null || _b === void 0 ? void 0 : _b.completion_tokens,
                                    totalTokens: (_c = openAIResponse.usage) === null || _c === void 0 ? void 0 : _c.total_tokens
                                }
                            }];
                    case 3:
                        error_4 = _d.sent();
                        console.error('LM Studio chat completion error:', error_4);
                        throw new Error("Failed to generate chat completion: ".concat(error_4));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stream a text completion from LM Studio
     */
    LMStudioProvider.prototype.streamCompletion = function (model, prompt, systemPrompt, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, request, response, stream_1, buffer_1, contentSoFar_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // For system prompts, use the chat API
                        if (systemPrompt) {
                            messages = [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: prompt }
                            ];
                            return [2 /*return*/, this.streamChatCompletion(model, messages, options, callback)];
                        }
                        request = {
                            model: model,
                            prompt: prompt,
                            temperature: options === null || options === void 0 ? void 0 : options.temperature,
                            max_tokens: options === null || options === void 0 ? void 0 : options.maxTokens,
                            stream: true
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/completions"), request, {
                                headers: { 'Content-Type': 'application/json' },
                                responseType: 'stream'
                            })];
                    case 2:
                        response = _a.sent();
                        stream_1 = response.data;
                        buffer_1 = '';
                        contentSoFar_1 = '';
                        stream_1.on('data', function (chunk) {
                            var _a;
                            var chunkStr = chunk.toString();
                            buffer_1 += chunkStr;
                            // Process complete lines from the stream
                            while (true) {
                                var lineEndIndex = buffer_1.indexOf('\n');
                                if (lineEndIndex === -1) {
                                    break;
                                }
                                var line = buffer_1.substring(0, lineEndIndex).trim();
                                buffer_1 = buffer_1.substring(lineEndIndex + 1);
                                if (line.startsWith('data: ')) {
                                    var data = line.substring(6);
                                    if (data === '[DONE]') {
                                        if (callback) {
                                            callback({ content: contentSoFar_1, done: true });
                                        }
                                        return;
                                    }
                                    try {
                                        var parsed = JSON.parse(data);
                                        var text = ((_a = parsed.choices[0]) === null || _a === void 0 ? void 0 : _a.text) || '';
                                        contentSoFar_1 += text;
                                        if (callback) {
                                            callback({ content: text, done: false });
                                        }
                                    }
                                    catch (e) {
                                        console.error('Failed to parse JSON:', e);
                                    }
                                }
                            }
                        });
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                stream_1.on('end', function () { return resolve(); });
                                stream_1.on('error', function (err) { return reject(err); });
                            })];
                    case 3:
                        error_5 = _a.sent();
                        console.error('LM Studio stream completion error:', error_5);
                        throw new Error("Failed to stream completion: ".concat(error_5));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Stream a chat completion from LM Studio
     */
    LMStudioProvider.prototype.streamChatCompletion = function (model, messages, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var openAIMessages, request, response, stream_2, buffer_2, contentSoFar_2, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        openAIMessages = messages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        request = {
                            model: model,
                            messages: openAIMessages,
                            temperature: options === null || options === void 0 ? void 0 : options.temperature,
                            max_tokens: options === null || options === void 0 ? void 0 : options.maxTokens,
                            stream: true
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post("".concat(this.baseUrl, "/chat/completions"), request, {
                                headers: { 'Content-Type': 'application/json' },
                                responseType: 'stream'
                            })];
                    case 2:
                        response = _a.sent();
                        stream_2 = response.data;
                        buffer_2 = '';
                        contentSoFar_2 = '';
                        stream_2.on('data', function (chunk) {
                            var _a, _b;
                            var chunkStr = chunk.toString();
                            buffer_2 += chunkStr;
                            // Process complete lines from the stream
                            while (true) {
                                var lineEndIndex = buffer_2.indexOf('\n');
                                if (lineEndIndex === -1) {
                                    break;
                                }
                                var line = buffer_2.substring(0, lineEndIndex).trim();
                                buffer_2 = buffer_2.substring(lineEndIndex + 1);
                                if (line.startsWith('data: ')) {
                                    var data = line.substring(6);
                                    if (data === '[DONE]') {
                                        if (callback) {
                                            callback({ content: contentSoFar_2, done: true });
                                        }
                                        return;
                                    }
                                    try {
                                        var parsed = JSON.parse(data);
                                        var content = ((_b = (_a = parsed.choices[0]) === null || _a === void 0 ? void 0 : _a.delta) === null || _b === void 0 ? void 0 : _b.content) || '';
                                        if (content) {
                                            contentSoFar_2 += content;
                                            if (callback) {
                                                callback({ content: content, done: false });
                                            }
                                        }
                                    }
                                    catch (e) {
                                        console.error('Failed to parse JSON:', e);
                                    }
                                }
                            }
                        });
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                stream_2.on('end', function () { return resolve(); });
                                stream_2.on('error', function (err) { return reject(err); });
                            })];
                    case 3:
                        error_6 = _a.sent();
                        console.error('LM Studio stream chat completion error:', error_6);
                        throw new Error("Failed to stream chat completion: ".concat(error_6));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return LMStudioProvider;
}());
exports.LMStudioProvider = LMStudioProvider;
