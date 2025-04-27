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
var ollama_provider_1 = require("../../src/llm/ollama-provider");
var lmstudio_provider_1 = require("../../src/llm/lmstudio-provider");
var axios_1 = require("axios");
var stream_1 = require("stream");
jest.mock('axios');
var mockedAxios = axios_1.default;
describe('LLM Providers', function () {
    beforeEach(function () {
        jest.clearAllMocks();
        mockedAxios.get.mockResolvedValue({
            data: {
                models: ['llama2', 'codellama'],
                response: 'Test response',
                message: { content: 'Test response' },
                choices: [{ message: { content: 'Test response' } }]
            }
        });
        mockedAxios.post.mockResolvedValue({
            data: {
                response: 'Test response',
                message: { content: 'Test response' },
                choices: [{ message: { content: 'Test response' } }]
            }
        });
    });
    describe('OllamaProvider', function () {
        test('has correct name', function () {
            var provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
            expect(provider.name).toBe('Ollama');
        });
        test('checks availability', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, isAvailable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        return [4 /*yield*/, provider.isAvailable()];
                    case 1:
                        isAvailable = _a.sent();
                        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/tags');
                        expect(isAvailable).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('gets available models', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        return [4 /*yield*/, provider.getAvailableModels()];
                    case 1:
                        models = _a.sent();
                        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:11434/tags');
                        expect(Array.isArray(models)).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('generates completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        return [4 /*yield*/, provider.generateCompletion('llama2', 'Hello world', undefined, { temperature: 0.7 })];
                    case 1:
                        response = _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:11434/generate', {
                            model: 'llama2',
                            prompt: 'Hello world',
                            system: undefined,
                            options: {
                                temperature: 0.7,
                                num_predict: undefined
                            },
                            stream: false
                        });
                        expect(response.content).toBe('Test response');
                        return [2 /*return*/];
                }
            });
        }); });
        test('generates chat completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, messages, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        messages = [
                            { role: 'user', content: 'Hello' },
                            { role: 'assistant', content: 'Hi there!' }
                        ];
                        return [4 /*yield*/, provider.generateChatCompletion('llama2', messages, { temperature: 0.7 })];
                    case 1:
                        response = _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:11434/chat', {
                            messages: messages,
                            model: 'llama2',
                            options: {
                                temperature: 0.7,
                                num_predict: undefined
                            },
                            stream: false
                        });
                        expect(response.content).toBe('Test response');
                        return [2 /*return*/];
                }
            });
        }); });
        test('streams completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, events, mockStream, streamPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        events = [];
                        mockStream = new stream_1.Readable({
                            read: function () { } // No-op since we'll push data manually
                        });
                        mockedAxios.post.mockResolvedValueOnce({
                            data: mockStream
                        });
                        streamPromise = provider.streamCompletion('llama2', 'Hello world', undefined, { temperature: 0.7 }, function (event) { return events.push(event); });
                        // Simulate streaming data
                        mockStream.push(JSON.stringify({ response: 'Test', done: false }) + '\n');
                        mockStream.push(JSON.stringify({ response: ' response', done: true }) + '\n');
                        mockStream.push(null); // End the stream
                        return [4 /*yield*/, streamPromise];
                    case 1:
                        _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:11434/generate', {
                            model: 'llama2',
                            prompt: 'Hello world',
                            system: undefined,
                            options: {
                                temperature: 0.7,
                                num_predict: undefined
                            },
                            stream: true
                        }, { responseType: 'stream' });
                        expect(events).toEqual([
                            { content: 'Test', done: false },
                            { content: ' response', done: true }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('streams chat completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, messages, events, mockStream, streamPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        messages = [
                            { role: 'user', content: 'Hello' }
                        ];
                        events = [];
                        mockStream = new stream_1.Readable({
                            read: function () { } // No-op since we'll push data manually
                        });
                        mockedAxios.post.mockResolvedValueOnce({
                            data: mockStream
                        });
                        streamPromise = provider.streamChatCompletion('llama2', messages, { temperature: 0.7 }, function (event) { return events.push(event); });
                        // Simulate streaming data
                        mockStream.push(JSON.stringify({ message: { content: 'Test' }, done: false }) + '\n');
                        mockStream.push(JSON.stringify({ message: { content: ' response' }, done: true }) + '\n');
                        mockStream.push(null); // End the stream
                        return [4 /*yield*/, streamPromise];
                    case 1:
                        _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:11434/chat', {
                            messages: messages,
                            model: 'llama2',
                            options: {
                                temperature: 0.7,
                                num_predict: undefined
                            },
                            stream: true
                        }, { responseType: 'stream' });
                        expect(events).toEqual([
                            { content: 'Test', done: false },
                            { content: ' response', done: true }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));
                        provider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
                        return [4 /*yield*/, expect(provider.isAvailable()).resolves.toBe(false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('LMStudioProvider', function () {
        test('has correct name', function () {
            var provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
            expect(provider.name).toBe('LM Studio');
        });
        test('checks availability', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, isAvailable;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, provider.isAvailable()];
                    case 1:
                        isAvailable = _a.sent();
                        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/models');
                        expect(isAvailable).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        test('gets available models', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.get.mockResolvedValueOnce({
                            data: {
                                data: [
                                    { id: 'model1' },
                                    { id: 'model2' }
                                ]
                            }
                        });
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, provider.getAvailableModels()];
                    case 1:
                        models = _a.sent();
                        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:1234/models');
                        expect(models).toEqual(['model1', 'model2']);
                        return [2 /*return*/];
                }
            });
        }); });
        test('falls back to default model when models list fails', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, models;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.get.mockRejectedValueOnce(new Error('Failed to get models'));
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, provider.getAvailableModels()];
                    case 1:
                        models = _a.sent();
                        expect(models).toEqual(['local-model']);
                        return [2 /*return*/];
                }
            });
        }); });
        test('generates completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.post.mockResolvedValueOnce({
                            data: {
                                choices: [{ text: 'Test response' }],
                                usage: {
                                    prompt_tokens: 10,
                                    completion_tokens: 5,
                                    total_tokens: 15
                                }
                            }
                        });
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, provider.generateCompletion('model1', 'Hello world', undefined, { temperature: 0.7 })];
                    case 1:
                        response = _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:1234/completions', {
                            model: 'model1',
                            prompt: 'Hello world',
                            temperature: 0.7,
                            max_tokens: undefined,
                            stream: false
                        }, { headers: { 'Content-Type': 'application/json' } });
                        expect(response.content).toBe('Test response');
                        expect(response.usage).toEqual({
                            promptTokens: 10,
                            completionTokens: 5,
                            totalTokens: 15
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('generates chat completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, messages, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.post.mockResolvedValueOnce({
                            data: {
                                choices: [{
                                        message: { content: 'Test response' }
                                    }],
                                usage: {
                                    prompt_tokens: 10,
                                    completion_tokens: 5,
                                    total_tokens: 15
                                }
                            }
                        });
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        messages = [
                            { role: 'user', content: 'Hello' }
                        ];
                        return [4 /*yield*/, provider.generateChatCompletion('model1', messages, { temperature: 0.7 })];
                    case 1:
                        response = _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:1234/chat/completions', {
                            model: 'model1',
                            messages: [{ role: 'user', content: 'Hello' }],
                            temperature: 0.7,
                            max_tokens: undefined,
                            stream: false
                        }, { headers: { 'Content-Type': 'application/json' } });
                        expect(response.content).toBe('Test response');
                        expect(response.usage).toEqual({
                            promptTokens: 10,
                            completionTokens: 5,
                            totalTokens: 15
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('streams completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, events, mockStream, streamPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        events = [];
                        mockStream = new stream_1.Readable({
                            read: function () { } // No-op since we'll push data manually
                        });
                        mockedAxios.post.mockResolvedValueOnce({
                            data: mockStream
                        });
                        streamPromise = provider.streamCompletion('model1', 'Hello world', undefined, { temperature: 0.7 }, function (event) { return events.push(event); });
                        // Simulate streaming SSE data
                        mockStream.push('data: {"choices":[{"text":"Test"}]}\n\n');
                        mockStream.push('data: {"choices":[{"text":" response"}]}\n\n');
                        mockStream.push('data: [DONE]\n\n');
                        mockStream.push(null); // End the stream
                        return [4 /*yield*/, streamPromise];
                    case 1:
                        _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:1234/completions', {
                            model: 'model1',
                            prompt: 'Hello world',
                            temperature: 0.7,
                            max_tokens: undefined,
                            stream: true
                        }, {
                            headers: { 'Content-Type': 'application/json' },
                            responseType: 'stream'
                        });
                        expect(events).toEqual([
                            { content: 'Test', done: false },
                            { content: ' response', done: false },
                            { content: 'Test response', done: true }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('streams chat completion', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, messages, events, mockStream, streamPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        messages = [
                            { role: 'user', content: 'Hello' }
                        ];
                        events = [];
                        mockStream = new stream_1.Readable({
                            read: function () { } // No-op since we'll push data manually
                        });
                        mockedAxios.post.mockResolvedValueOnce({
                            data: mockStream
                        });
                        streamPromise = provider.streamChatCompletion('model1', messages, { temperature: 0.7 }, function (event) { return events.push(event); });
                        // Simulate streaming SSE data
                        mockStream.push('data: {"choices":[{"delta":{"content":"Test"}}]}\n\n');
                        mockStream.push('data: {"choices":[{"delta":{"content":" response"}}]}\n\n');
                        mockStream.push('data: [DONE]\n\n');
                        mockStream.push(null); // End the stream
                        return [4 /*yield*/, streamPromise];
                    case 1:
                        _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:1234/chat/completions', {
                            model: 'model1',
                            messages: [{ role: 'user', content: 'Hello' }],
                            temperature: 0.7,
                            max_tokens: undefined,
                            stream: true
                        }, {
                            headers: { 'Content-Type': 'application/json' },
                            responseType: 'stream'
                        });
                        expect(events).toEqual([
                            { content: 'Test', done: false },
                            { content: ' response', done: false },
                            { content: 'Test response', done: true }
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, expect(provider.isAvailable()).resolves.toBe(false)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles completion with system prompt', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.post.mockResolvedValueOnce({
                            data: {
                                choices: [{
                                        message: { content: 'Test response' }
                                    }],
                                usage: {
                                    prompt_tokens: 15,
                                    completion_tokens: 5,
                                    total_tokens: 20
                                }
                            }
                        });
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, provider.generateCompletion('model1', 'Hello world', 'You are a helpful assistant', { temperature: 0.7 })];
                    case 1:
                        response = _a.sent();
                        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
                        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:1234/chat/completions', {
                            model: 'model1',
                            messages: [
                                { role: 'system', content: 'You are a helpful assistant' },
                                { role: 'user', content: 'Hello world' }
                            ],
                            temperature: 0.7,
                            max_tokens: undefined,
                            stream: false
                        }, { headers: { 'Content-Type': 'application/json' } });
                        expect(response.content).toBe('Test response');
                        expect(response.usage).toEqual({
                            promptTokens: 15,
                            completionTokens: 5,
                            totalTokens: 20
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles rate limiting gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockedAxios.post.mockRejectedValueOnce({
                            response: {
                                status: 429,
                                data: { error: 'Rate limit exceeded' }
                            }
                        });
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        return [4 /*yield*/, expect(provider.generateCompletion('model1', 'Hello world', undefined, { temperature: 0.7 })).rejects.toThrow('Rate limit exceeded')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles large responses efficiently', function () { return __awaiter(void 0, void 0, void 0, function () {
            var largeResponse, provider, startHeap, response, endHeap, heapIncrease;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        largeResponse = {
                            choices: [{
                                    message: { content: 'A'.repeat(1000000) } // 1MB response
                                }],
                            usage: {
                                prompt_tokens: 10,
                                completion_tokens: 500000,
                                total_tokens: 500010
                            }
                        };
                        mockedAxios.post.mockResolvedValueOnce({ data: largeResponse });
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        startHeap = process.memoryUsage().heapUsed;
                        return [4 /*yield*/, provider.generateChatCompletion('model1', [{ role: 'user', content: 'Generate large response' }], { temperature: 0.7 })];
                    case 1:
                        response = _a.sent();
                        endHeap = process.memoryUsage().heapUsed;
                        heapIncrease = endHeap - startHeap;
                        // Response should be received correctly
                        expect(response.content).toHaveLength(1000000);
                        // Memory increase should be reasonable (less than 5MB overhead)
                        expect(heapIncrease).toBeLessThan(5 * 1024 * 1024);
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles streaming timeout gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, mockStream, streamPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        mockStream = new stream_1.Readable({
                            read: function () { } // No-op since we'll push data manually
                        });
                        mockedAxios.post.mockResolvedValueOnce({
                            data: mockStream
                        });
                        streamPromise = provider.streamCompletion('model1', 'Hello world', undefined, { temperature: 0.7 }, function () { });
                        // Simulate timeout by not sending any data
                        return [4 /*yield*/, expect(Promise.race([
                                streamPromise,
                                new Promise(function (_, reject) { return setTimeout(function () { return reject(new Error('Timeout')); }, 1000); })
                            ])).rejects.toThrow('Timeout')];
                    case 1:
                        // Simulate timeout by not sending any data
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles malformed streaming responses', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, mockStream, events, streamPromise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
                        mockStream = new stream_1.Readable({
                            read: function () { } // No-op since we'll push data manually
                        });
                        mockedAxios.post.mockResolvedValueOnce({
                            data: mockStream
                        });
                        events = [];
                        streamPromise = provider.streamCompletion('model1', 'Hello world', undefined, { temperature: 0.7 }, function (event) { return events.push(event); });
                        // Push malformed data
                        mockStream.push('data: {invalid json}\n\n');
                        mockStream.push('data: [DONE]\n\n');
                        mockStream.push(null);
                        return [4 /*yield*/, streamPromise];
                    case 1:
                        _a.sent();
                        expect(events.length).toBe(1);
                        expect(events[0]).toEqual({ content: '', done: true });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
