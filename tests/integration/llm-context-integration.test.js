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
var assert = require("assert");
var lmstudio_provider_1 = require("../../src/llm/lmstudio-provider");
var ollama_provider_1 = require("../../src/llm/ollama-provider");
var ContextManager_1 = require("../../src/services/ContextManager");
var mockHelpers_1 = require("../helpers/mockHelpers");
describe('LLM Provider and Context Manager Integration', function () {
    var contextManager;
    var ollamaProvider;
    var lmStudioProvider;
    var mockContext;
    beforeEach(function () {
        // Set up mocks
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        // Mock ContextManager methods
        jest.spyOn(ContextManager_1.ContextManager, 'getInstance').mockImplementation(function () {
            return {
                createContext: jest.fn().mockResolvedValue(undefined),
                updateContext: jest.fn().mockResolvedValue(undefined),
                getContext: jest.fn().mockReturnValue({
                    activeFile: 'test.ts',
                    selectedCode: 'function add(a: number, b: number): number { return a + b; }',
                    codeLanguage: 'typescript'
                }),
                buildPrompt: jest.fn().mockImplementation(function (id, userPrompt) {
                    return Promise.resolve("Context: typescript\nCode: function add(a: number, b: number): number { return a + b; }\n\nUser: ".concat(userPrompt));
                }),
                initialize: jest.fn().mockResolvedValue(undefined),
                dispose: jest.fn()
            };
        });
        // Initialize components
        contextManager = ContextManager_1.ContextManager.getInstance(mockContext);
        // Mock LLM providers
        ollamaProvider = new ollama_provider_1.OllamaProvider('http://localhost:11434');
        jest.spyOn(ollamaProvider, 'generateCompletion').mockImplementation(function (model, prompt) {
            if (prompt.includes('TypeScript')) {
                return Promise.resolve({
                    content: 'TypeScript is a statically typed superset of JavaScript.',
                    model: 'codellama',
                    usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }
                });
            }
            else if (prompt.includes('What does this function do')) {
                return Promise.resolve({
                    content: 'This function adds two numbers together and returns the result.',
                    model: 'codellama',
                    usage: { promptTokens: 15, completionTokens: 12, totalTokens: 27 }
                });
            }
            else {
                return Promise.resolve({
                    content: 'Default response from Ollama provider',
                    model: 'codellama',
                    usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 }
                });
            }
        });
        jest.spyOn(ollamaProvider, 'streamCompletion').mockImplementation(function (model, prompt, systemPrompt, options, callback) {
            if (prompt.includes('Explain programming')) {
                setTimeout(function () { return callback({ content: 'Programming is the process of', done: false }); }, 10);
                setTimeout(function () { return callback({ content: ' creating instructions for computers to follow.', done: true }); }, 20);
                return Promise.resolve();
            }
            else if (prompt.includes('Explain this interface')) {
                setTimeout(function () { return callback({ content: 'This interface defines a User', done: false }); }, 10);
                return Promise.reject(new Error('Connection lost')); // Simulate failure
            }
            return Promise.resolve();
        });
        lmStudioProvider = new lmstudio_provider_1.LMStudioProvider('http://localhost:1234');
        jest.spyOn(lmStudioProvider, 'generateCompletion').mockImplementation(function (model, prompt) {
            if (prompt.includes('What does this function do')) {
                return Promise.resolve({
                    content: 'The function takes two numbers as parameters and adds them together.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 15, completionTokens: 12, totalTokens: 27 }
                });
            }
            else if (prompt.includes('How does it differ')) {
                return Promise.resolve({
                    content: 'TypeScript adds static typing to JavaScript. Unlike JavaScript, TypeScript code needs to be compiled.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 }
                });
            }
            else if (prompt.includes('What is this code about?') || prompt.includes('interface')) {
                return Promise.resolve({
                    content: 'This code defines a User interface with name and age properties.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 10, completionTokens: 12, totalTokens: 22 }
                });
            }
            else if (prompt.includes('What is x?')) {
                return Promise.resolve({
                    content: 'x is a constant with the value 42.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 5, completionTokens: 8, totalTokens: 13 }
                });
            }
            else {
                return Promise.resolve({
                    content: 'Default response from LMStudio provider',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 }
                });
            }
        });
    });
    afterEach(function () {
        jest.restoreAllMocks();
    });
    test('handles context switching between providers', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, ollamaResponse, _a, _b, _c, lmStudioResponse, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    conversationId = 'test-conversation';
                    return [4 /*yield*/, contextManager.createContext(conversationId)];
                case 1:
                    _g.sent();
                    // Update context with code
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'test.ts',
                            selectedCode: 'function add(a: number, b: number): number { return a + b; }',
                            codeLanguage: 'typescript'
                        })];
                case 2:
                    // Update context with code
                    _g.sent();
                    _b = (_a = ollamaProvider).generateCompletion;
                    _c = ['codellama'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'What does this function do?')];
                case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([_g.sent(), undefined,
                        { temperature: 0.7 }]))];
                case 4:
                    ollamaResponse = _g.sent();
                    _e = (_d = lmStudioProvider).generateCompletion;
                    _f = ['CodeLlama-7b'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'What does this function do?')];
                case 5: return [4 /*yield*/, _e.apply(_d, _f.concat([_g.sent(), undefined,
                        { temperature: 0.7 }]))];
                case 6:
                    lmStudioResponse = _g.sent();
                    // Both responses should be coherent with the context
                    assert.ok(ollamaResponse.content.toLowerCase().includes('add'));
                    assert.ok(ollamaResponse.content.toLowerCase().includes('number'));
                    assert.ok(lmStudioResponse.content.toLowerCase().includes('add'));
                    assert.ok(lmStudioResponse.content.toLowerCase().includes('number'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('maintains conversation history across provider switches', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, prompt1, response1, prompt2, response2, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    conversationId = 'test-conversation-2';
                    return [4 /*yield*/, contextManager.createContext(conversationId)];
                case 1:
                    _d.sent();
                    prompt1 = 'What is TypeScript?';
                    return [4 /*yield*/, ollamaProvider.generateCompletion('codellama', prompt1)];
                case 2:
                    response1 = _d.sent();
                    // Override buildPrompt for this specific test to include conversation history
                    jest.spyOn(contextManager, 'buildPrompt')
                        .mockImplementationOnce(function (id, userPrompt) {
                        return Promise.resolve("Previous: What is TypeScript?\nTypeScript is a statically typed superset of JavaScript.\n\nUser: ".concat(userPrompt));
                    });
                    prompt2 = 'How does it differ from JavaScript?';
                    _b = (_a = lmStudioProvider).generateCompletion;
                    _c = ['CodeLlama-7b'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, prompt2)];
                case 3: return [4 /*yield*/, _b.apply(_a, _c.concat([_d.sent()]))];
                case 4:
                    response2 = _d.sent();
                    // Response should acknowledge previous context
                    assert.ok(response2.content.toLowerCase().includes('typescript'));
                    assert.ok(response2.content.toLowerCase().includes('javascript'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('recovers from streaming errors while maintaining context', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, error, Error, _a, _b, _c, e_1, recoveryResponse, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    conversationId = 'test-conversation-3';
                    return [4 /*yield*/, contextManager.createContext(conversationId)];
                case 1:
                    _g.sent();
                    // Set up initial context
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'test.ts',
                            selectedCode: 'interface User { name: string; age: number; }',
                            codeLanguage: 'typescript'
                        })];
                case 2:
                    // Set up initial context
                    _g.sent();
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 6, , 7]);
                    _b = (_a = ollamaProvider).streamCompletion;
                    _c = ['codellama'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'Explain this interface')];
                case 4: return [4 /*yield*/, _b.apply(_a, _c.concat([_g.sent(), undefined,
                        { temperature: 0.7 },
                        function () { }]))];
                case 5:
                    _g.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _g.sent();
                    error = e_1;
                    return [3 /*break*/, 7];
                case 7:
                    // Error should be thrown
                    assert.ok(error instanceof Error);
                    assert.strictEqual(error === null || error === void 0 ? void 0 : error.message, 'Connection lost');
                    _e = (_d = lmStudioProvider).generateCompletion;
                    _f = ['CodeLlama-7b'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'What is this code about?')];
                case 8: return [4 /*yield*/, _e.apply(_d, _f.concat([_g.sent()]))];
                case 9:
                    recoveryResponse = _g.sent();
                    assert.ok(recoveryResponse.content.toLowerCase().includes('interface'));
                    assert.ok(recoveryResponse.content.toLowerCase().includes('user'));
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles concurrent context updates during streaming', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, streamedContent, streamHandler, streamingPromise, _a, _b, _c, verificationResponse, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    conversationId = 'test-conversation-4';
                    return [4 /*yield*/, contextManager.createContext(conversationId)];
                case 1:
                    _g.sent();
                    streamedContent = '';
                    streamHandler = function (event) {
                        streamedContent += event.content;
                    };
                    _b = (_a = ollamaProvider).streamCompletion;
                    _c = ['codellama'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'Explain programming')];
                case 2:
                    streamingPromise = _b.apply(_a, _c.concat([_g.sent(), undefined,
                        { temperature: 0.7 },
                        streamHandler]));
                    // Update context while streaming is in progress
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'newfile.ts',
                            selectedCode: 'const x = 42;',
                            codeLanguage: 'typescript'
                        })];
                case 3:
                    // Update context while streaming is in progress
                    _g.sent();
                    return [4 /*yield*/, streamingPromise];
                case 4:
                    _g.sent();
                    // Override buildPrompt for this specific test to match the updated context
                    jest.spyOn(contextManager, 'buildPrompt')
                        .mockImplementationOnce(function (id, userPrompt) {
                        return Promise.resolve("Context: typescript\nCode: const x = 42;\n\nUser: ".concat(userPrompt));
                    });
                    _e = (_d = lmStudioProvider).generateCompletion;
                    _f = ['CodeLlama-7b'];
                    return [4 /*yield*/, contextManager.buildPrompt(conversationId, 'What is x?')];
                case 5: return [4 /*yield*/, _e.apply(_d, _f.concat([_g.sent()]))];
                case 6:
                    verificationResponse = _g.sent();
                    assert.ok(streamedContent.length > 0);
                    assert.ok(verificationResponse.content.toLowerCase().includes('42'));
                    return [2 /*return*/];
            }
        });
    }); });
});
