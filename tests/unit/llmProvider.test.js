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
var ollamaProvider_1 = require("../../src/llmProviders/ollamaProvider");
var lmStudioProvider_1 = require("../../src/llmProviders/lmStudioProvider");
var llmProviderFactory_1 = require("../../src/llmProviders/llmProviderFactory");
describe('LLM Providers', function () {
    beforeEach(function () {
        jest.clearAllMocks();
    });
    describe('OllamaProvider', function () {
        test('initializes with correct configuration', function () {
            var provider = new ollamaProvider_1.OllamaProvider({
                host: 'http://localhost',
                port: 11434,
                model: 'llama2'
            });
            expect(provider.getHost()).toBe('http://localhost');
            expect(provider.getPort()).toBe(11434);
            expect(provider.getModel()).toBe('llama2');
        });
        test('sends prompt and receives response', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollamaProvider_1.OllamaProvider({
                            host: 'http://localhost',
                            port: 11434,
                            model: 'llama2'
                        });
                        global.fetch = jest.fn().mockResolvedValue({
                            ok: true,
                            json: jest.fn().mockResolvedValue({
                                response: 'Test response',
                                model: 'llama2'
                            })
                        });
                        return [4 /*yield*/, provider.sendPrompt('Hello, world!')];
                    case 1:
                        response = _a.sent();
                        expect(global.fetch).toHaveBeenCalledTimes(1);
                        expect(global.fetch).toHaveBeenCalledWith('http://localhost:11434/api/generate', expect.objectContaining({
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        }));
                        expect(response).toContain('Test response');
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles connection errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new ollamaProvider_1.OllamaProvider({
                            host: 'http://localhost',
                            port: 11434,
                            model: 'llama2'
                        });
                        global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));
                        return [4 /*yield*/, expect(provider.sendPrompt('Hello, world!')).rejects.toThrow('Connection failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('LMStudioProvider', function () {
        test('initializes with correct configuration', function () {
            var provider = new lmStudioProvider_1.LMStudioProvider({
                host: 'http://localhost',
                port: 1234,
                model: 'mistral'
            });
            expect(provider.getHost()).toBe('http://localhost');
            expect(provider.getPort()).toBe(1234);
            expect(provider.getModel()).toBe('mistral');
        });
        test('sends prompt and receives response', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmStudioProvider_1.LMStudioProvider({
                            host: 'http://localhost',
                            port: 1234,
                            model: 'mistral'
                        });
                        global.fetch = jest.fn().mockResolvedValue({
                            ok: true,
                            json: jest.fn().mockResolvedValue({
                                choices: [{
                                        message: {
                                            content: 'Test response'
                                        }
                                    }]
                            })
                        });
                        return [4 /*yield*/, provider.sendPrompt('Hello, world!')];
                    case 1:
                        response = _a.sent();
                        expect(global.fetch).toHaveBeenCalledTimes(1);
                        expect(global.fetch).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', expect.objectContaining({
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        }));
                        expect(response).toContain('Test response');
                        return [2 /*return*/];
                }
            });
        }); });
        test('handles connection errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = new lmStudioProvider_1.LMStudioProvider({
                            host: 'http://localhost',
                            port: 1234,
                            model: 'mistral'
                        });
                        global.fetch = jest.fn().mockRejectedValue(new Error('Connection failed'));
                        return [4 /*yield*/, expect(provider.sendPrompt('Hello, world!')).rejects.toThrow('Connection failed')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('LLMProviderFactory', function () {
        test('creates Ollama provider', function () {
            var factory = new llmProviderFactory_1.LLMProviderFactory();
            var provider = factory.createProvider('ollama', {
                host: 'http://localhost',
                port: 11434,
                model: 'llama2'
            });
            expect(provider).toBeInstanceOf(ollamaProvider_1.OllamaProvider);
        });
        test('creates LM Studio provider', function () {
            var factory = new llmProviderFactory_1.LLMProviderFactory();
            var provider = factory.createProvider('lmstudio', {
                host: 'http://localhost',
                port: 1234,
                model: 'mistral'
            });
            expect(provider).toBeInstanceOf(lmStudioProvider_1.LMStudioProvider);
        });
        test('throws error for invalid provider', function () {
            var factory = new llmProviderFactory_1.LLMProviderFactory();
            expect(function () { return factory.createProvider('invalid', {}); }).toThrow();
        });
    });
});
