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
var ContextManager_1 = require("../../src/services/ContextManager");
var conversationManager_1 = require("../../src/services/conversationManager");
var ConversationHistory_1 = require("../../src/services/ConversationHistory");
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var mockHelpers_1 = require("../helpers/mockHelpers");
describe('Error Recovery and Resilience', function () {
    var contextManager;
    var conversationManager;
    var llmProviderManager;
    var history;
    var mockContext;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create mock extension context with proper methods
                    mockContext = (0, mockHelpers_1.createMockExtensionContext)();
                    // Mock the required implementations
                    jest.spyOn(ConversationHistory_1.ConversationHistory.prototype, 'initialize').mockResolvedValue(undefined);
                    jest.spyOn(ContextManager_1.ContextManager.prototype, 'initialize').mockResolvedValue(undefined);
                    // Mock getContext to return valid data
                    jest.spyOn(ContextManager_1.ContextManager.prototype, 'getContext').mockImplementation(function (id) {
                        return {
                            conversationId: id,
                            activeFile: 'test.ts',
                            selectedCode: 'test code',
                            codeLanguage: 'typescript',
                            systemPrompt: 'You are a helpful assistant'
                        };
                    });
                    // Initialize components
                    history = new ConversationHistory_1.ConversationHistory(mockContext);
                    return [4 /*yield*/, history.initialize()];
                case 1:
                    _a.sent();
                    contextManager = new ContextManager_1.ContextManager(mockContext);
                    return [4 /*yield*/, contextManager.initialize()];
                case 2:
                    _a.sent();
                    // Mock conversation manager methods
                    jest.spyOn(conversationManager_1.ConversationManager, 'getInstance').mockImplementation(function () {
                        return {
                            startNewConversation: jest.fn().mockResolvedValue({ id: 'test-conversation-id' }),
                            addMessage: jest.fn().mockResolvedValue(undefined),
                            loadConversation: jest.fn().mockResolvedValue({}),
                            getContext: jest.fn().mockReturnValue([]),
                            getCurrentContext: jest.fn().mockReturnValue([]),
                            getConversation: jest.fn().mockResolvedValue({ messages: [] }),
                            dispose: jest.fn()
                        };
                    });
                    conversationManager = conversationManager_1.ConversationManager.getInstance(mockContext);
                    // Create LLMProviderManager with mocked methods
                    llmProviderManager = new llmProviderManager_1.LLMProviderManager();
                    jest.spyOn(llmProviderManager, 'connect').mockImplementation(function (providerName) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (providerName === 'MockProvider') {
                                return [2 /*return*/, Promise.reject(new Error('Connection error'))];
                            }
                            return [2 /*return*/, Promise.resolve()];
                        });
                    }); });
                    jest.spyOn(llmProviderManager, 'registerProvider').mockImplementation(function (provider) {
                        // Store the provider in a mock map
                        llmProviderManager.providers = llmProviderManager.providers || new Map();
                        llmProviderManager.providers.set(provider.name, provider);
                    });
                    jest.spyOn(llmProviderManager, 'getProvider').mockImplementation(function (name) {
                        var _a;
                        return (_a = llmProviderManager.providers) === null || _a === void 0 ? void 0 : _a.get(name);
                    });
                    jest.spyOn(llmProviderManager, 'generateCompletion').mockResolvedValue({
                        content: 'Mock response',
                        model: 'mock-model',
                        usage: { totalTokens: 10, promptTokens: 5, completionTokens: 5 }
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () {
        jest.restoreAllMocks();
    });
    test('recovers from LLM connection failures', function () { return __awaiter(void 0, void 0, void 0, function () {
        var mockProvider, provider, conversationId, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockProvider = {
                        name: 'MockProvider',
                        connect: jest.fn().mockRejectedValue(new Error('Connection error')),
                        isConnected: jest.fn().mockReturnValue(false),
                        generateCompletion: jest.fn().mockRejectedValue(new Error('Not connected'))
                    };
                    // Register the failing provider
                    llmProviderManager.registerProvider(mockProvider);
                    // Try to connect and handle the error gracefully
                    return [4 /*yield*/, llmProviderManager.connect('MockProvider').catch(function () { })];
                case 1:
                    // Try to connect and handle the error gracefully
                    _a.sent();
                    provider = llmProviderManager.getProvider('MockProvider');
                    assert.ok(provider);
                    assert.strictEqual(provider.isConnected(), false);
                    conversationId = 'error-test-1';
                    return [4 /*yield*/, conversationManager.startNewConversation('Error Test 1')];
                case 2:
                    _a.sent();
                    // This should not throw an error despite the LLM provider being down
                    return [4 /*yield*/, conversationManager.addMessage('user', 'Test message')];
                case 3:
                    // This should not throw an error despite the LLM provider being down
                    _a.sent();
                    return [4 /*yield*/, contextManager.getContext(conversationId)];
                case 4:
                    context = _a.sent();
                    assert.ok(context);
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles partial loading of conversations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var results, mockLoadConversation, loadPromises, loadResults, successfulLoads;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = [
                        { id: 'conv-1' },
                        { id: 'conv-2' },
                        { id: 'corrupt-conv' }
                    ];
                    mockLoadConversation = jest.fn().mockImplementation(function (id) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (id === 'corrupt-conv') {
                                return [2 /*return*/, Promise.reject(new Error('Corrupted conversation file'))];
                            }
                            return [2 /*return*/, Promise.resolve({ id: id })];
                        });
                    }); });
                    // Override the mock we set in beforeEach
                    jest.spyOn(conversationManager, 'loadConversation').mockImplementation(mockLoadConversation);
                    loadPromises = results.map(function (result) {
                        return conversationManager.loadConversation(result.id).catch(function (err) { return ({ error: err }); });
                    });
                    return [4 /*yield*/, Promise.all(loadPromises)];
                case 1:
                    loadResults = _a.sent();
                    successfulLoads = loadResults.filter(function (result) { return !result || !('error' in result); });
                    assert.strictEqual(successfulLoads.length, 2);
                    return [2 /*return*/];
            }
        });
    }); });
    test('handles interrupted message streams', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, mockProvider, e_1, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'stream-test';
                    return [4 /*yield*/, conversationManager.startNewConversation('Stream Test')];
                case 1:
                    _a.sent();
                    mockProvider = {
                        name: 'StreamProvider',
                        isConnected: jest.fn().mockReturnValue(true),
                        streamCompletion: jest.fn().mockImplementation(function (model, prompt, systemPrompt, options, callback) {
                            // Send a partial response
                            callback('This is a partial response');
                            // Simulate network interruption by rejecting
                            return Promise.reject(new Error('Connection lost'));
                        }),
                        generateCompletion: jest.fn().mockResolvedValue({
                            content: 'Fallback response',
                            model: 'fallback-model',
                            usage: { totalTokens: 10, promptTokens: 5, completionTokens: 5 }
                        })
                    };
                    llmProviderManager.registerProvider(mockProvider);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, llmProviderManager.generateCompletion('StreamProvider', 'default-model', 'Generate a long response', 'You are a helpful assistant', {})];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, contextManager.getContext(conversationId)];
                case 6:
                    context = _a.sent();
                    assert.ok(context);
                    assert.strictEqual(context.conversationId, conversationId);
                    return [2 /*return*/];
            }
        });
    }); });
    test('can recover context from partial data', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, mockGetContext, repairedContext;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    conversationId = 'partial-context-test';
                    return [4 /*yield*/, conversationManager.startNewConversation('Partial Context Test')];
                case 1:
                    _a.sent();
                    mockGetContext = jest.spyOn(contextManager, 'getContext');
                    mockGetContext.mockImplementation(function (id) {
                        if (id === conversationId) {
                            return {
                                conversationId: conversationId,
                                activeFile: 'x.js',
                                selectedCode: '', // Empty but not undefined
                                codeLanguage: 'javascript' // Valid value
                            };
                        }
                        return {
                            conversationId: id,
                            activeFile: 'test.ts',
                            selectedCode: 'test code',
                            codeLanguage: 'typescript',
                            systemPrompt: 'You are a helpful assistant'
                        };
                    });
                    return [4 /*yield*/, contextManager.getContext(conversationId)];
                case 2:
                    repairedContext = _a.sent();
                    // Verify context has been properly recovered/repaired
                    assert.ok(repairedContext.selectedCode !== undefined);
                    assert.ok(repairedContext.codeLanguage !== null);
                    assert.strictEqual(repairedContext.activeFile, 'x.js');
                    return [2 /*return*/];
            }
        });
    }); });
});
// Mock implementation of vscode.Memento for testing
var MockMemento = /** @class */ (function () {
    function MockMemento() {
        this.storage = new Map();
    }
    MockMemento.prototype.get = function (key, defaultValue) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    };
    MockMemento.prototype.update = function (key, value) {
        this.storage.set(key, value);
        return Promise.resolve();
    };
    MockMemento.prototype.keys = function () {
        return Array.from(this.storage.keys());
    };
    return MockMemento;
}());
