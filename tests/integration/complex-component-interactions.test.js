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
var llmProviderManager_1 = require("../../src/llm/llmProviderManager");
var snippetManager_1 = require("../../src/services/snippetManager");
var mockHelpers_1 = require("../helpers/mockHelpers");
describe('Complex Component Interactions', function () {
    var contextManager;
    var conversationManager;
    var llmProviderManager;
    var snippetManager;
    var mockContext;
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Create mock extension context
            mockContext = (0, mockHelpers_1.createMockExtensionContext)();
            // Mock implementations
            jest.spyOn(ContextManager_1.ContextManager, 'getInstance').mockImplementation(function () {
                return {
                    initialize: jest.fn().mockResolvedValue(undefined),
                    getContext: jest.fn().mockImplementation(function (conversationId) { return ({
                        conversationId: conversationId,
                        activeFile: 'example.ts',
                        selectedCode: 'interface TestInterface { prop1: string; prop2: number; }',
                        codeLanguage: 'typescript'
                    }); }),
                    updateContext: jest.fn().mockResolvedValue(undefined),
                    buildContextString: jest.fn().mockResolvedValue('context string'),
                    dispose: jest.fn()
                };
            });
            jest.spyOn(conversationManager_1.ConversationManager, 'getInstance').mockImplementation(function () {
                var messages = [
                    { role: 'user', content: 'What is this interface for?' },
                    { role: 'assistant', content: 'This interface contains string and number properties' }
                ];
                return {
                    initialize: jest.fn().mockResolvedValue(undefined),
                    startNewConversation: jest.fn().mockImplementation(function (title) {
                        return Promise.resolve({ id: "conversation-".concat(Date.now()), title: title });
                    }),
                    loadConversation: jest.fn().mockResolvedValue({}),
                    addMessage: jest.fn().mockResolvedValue(undefined),
                    getCurrentContext: jest.fn().mockReturnValue(messages),
                    getConversation: jest.fn().mockImplementation(function (id) {
                        return Promise.resolve({ id: id, messages: messages });
                    }),
                    dispose: jest.fn()
                };
            });
            jest.spyOn(llmProviderManager_1.LLMProviderManager.prototype, 'registerProvider').mockImplementation(function (provider) {
                // Mock provider registration
                this.providers = this.providers || new Map();
                this.providers.set(provider.name, provider);
            });
            jest.spyOn(llmProviderManager_1.LLMProviderManager.prototype, 'generateCompletion').mockImplementation(function (providerName, model, prompt) {
                if (prompt.includes('programming concepts')) {
                    return Promise.resolve({
                        content: 'Programming concepts include variables, functions, and classes',
                        model: model,
                        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
                    });
                }
                return Promise.resolve({
                    content: 'This interface contains string and number properties',
                    model: model,
                    usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 }
                });
            });
            jest.spyOn(snippetManager_1.SnippetManager, 'getInstance').mockImplementation(function () {
                var snippets = new Map();
                return {
                    initialize: jest.fn().mockResolvedValue(undefined),
                    createSnippet: jest.fn().mockImplementation(function (title, messages, tags, conversationId) {
                        var id = "snippet-".concat(Date.now());
                        var snippet = { id: id, title: title, messages: messages, tags: tags, conversationId: conversationId, createdAt: Date.now() };
                        snippets.set(id, snippet);
                        return Promise.resolve(snippet);
                    }),
                    getSnippet: jest.fn().mockImplementation(function (id) { return snippets.get(id); }),
                    getAllSnippets: jest.fn().mockImplementation(function () { return Array.from(snippets.values()); }),
                    deleteSnippet: jest.fn().mockImplementation(function (id) {
                        snippets.delete(id);
                        return Promise.resolve(true);
                    }),
                    dispose: jest.fn()
                };
            });
            // Initialize the components
            contextManager = ContextManager_1.ContextManager.getInstance(mockContext);
            conversationManager = conversationManager_1.ConversationManager.getInstance(mockContext);
            llmProviderManager = new llmProviderManager_1.LLMProviderManager();
            snippetManager = snippetManager_1.SnippetManager.getInstance(mockContext);
            return [2 /*return*/];
        });
    }); });
    afterEach(function () {
        jest.restoreAllMocks();
    });
    test('integrates context, conversations and LLM responses', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, mockProvider, response, response2, context;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, conversationManager.startNewConversation('Test Conversation')];
                case 1:
                    conversationId = (_a.sent()).id;
                    // Set up some context data
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'example.ts',
                            selectedCode: 'interface TestInterface { prop1: string; prop2: number; }',
                            codeLanguage: 'typescript'
                        })];
                case 2:
                    // Set up some context data
                    _a.sent();
                    mockProvider = {
                        name: 'TestProvider',
                        isConnected: jest.fn().mockReturnValue(true),
                        generateCompletion: jest.fn().mockResolvedValue({
                            content: 'This interface contains string and number properties',
                            model: 'test-model',
                            usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 }
                        })
                    };
                    llmProviderManager.registerProvider(mockProvider);
                    return [4 /*yield*/, llmProviderManager.generateCompletion('TestProvider', 'test-model', 'What is this interface for?', 'You are analyzing code', {})];
                case 3:
                    response = _a.sent();
                    // Add the user message and LLM response to the conversation
                    return [4 /*yield*/, conversationManager.addMessage('user', 'What is this interface for?')];
                case 4:
                    // Add the user message and LLM response to the conversation
                    _a.sent();
                    return [4 /*yield*/, conversationManager.addMessage('assistant', response.content)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, llmProviderManager.generateCompletion('TestProvider', 'test-model', 'What are the properties of this interface?', 'You are analyzing code', {})];
                case 6:
                    response2 = _a.sent();
                    return [4 /*yield*/, conversationManager.addMessage('user', 'What are the properties of this interface?')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, conversationManager.addMessage('assistant', response2.content)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, contextManager.getContext(conversationId)];
                case 9:
                    context = _a.sent();
                    assert.strictEqual(context.activeFile, 'example.ts');
                    return [2 /*return*/];
            }
        });
    }); });
    test('passes context between components correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, context, conversation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, conversationManager.startNewConversation('Context Test')];
                case 1:
                    conversationId = (_a.sent()).id;
                    // Set up initial context
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'example1.ts',
                            selectedCode: 'function test() {}',
                            codeLanguage: 'typescript'
                        })];
                case 2:
                    // Set up initial context
                    _a.sent();
                    // Create a new message using the context
                    return [4 /*yield*/, llmProviderManager.registerProvider({
                            name: 'TestProvider',
                            isConnected: jest.fn().mockReturnValue(true),
                            generateCompletion: jest.fn().mockImplementation(function (model, prompt, systemPrompt) {
                                if (prompt.includes('programming concepts')) {
                                    return Promise.resolve({
                                        content: 'Programming concepts include variables, functions, and classes',
                                        model: 'test-model',
                                        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
                                    });
                                }
                                return Promise.resolve({
                                    content: 'Standard response',
                                    model: 'test-model',
                                    usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 }
                                });
                            })
                        })];
                case 3:
                    // Create a new message using the context
                    _a.sent();
                    // Generate a completion that should use the context
                    return [4 /*yield*/, llmProviderManager.generateCompletion('TestProvider', 'test-model', 'Explain programming concepts', 'You are a coding assistant', {})];
                case 4:
                    // Generate a completion that should use the context
                    _a.sent();
                    // Update the context with new information
                    return [4 /*yield*/, contextManager.updateContext(conversationId, {
                            activeFile: 'example2.ts',
                            selectedCode: 'function test2() {}',
                            codeLanguage: 'typescript'
                        })];
                case 5:
                    // Update the context with new information
                    _a.sent();
                    return [4 /*yield*/, contextManager.getContext(conversationId)];
                case 6:
                    context = _a.sent();
                    assert.strictEqual(context.activeFile, 'example2.ts');
                    assert.strictEqual(context.selectedCode, 'function test2() {}');
                    // Add messages to the conversation
                    return [4 /*yield*/, conversationManager.addMessage('user', 'How do I use this function?')];
                case 7:
                    // Add messages to the conversation
                    _a.sent();
                    return [4 /*yield*/, conversationManager.getConversation(conversationId)];
                case 8:
                    conversation = _a.sent();
                    assert.ok(conversation.messages);
                    return [2 /*return*/];
            }
        });
    }); });
    test('snippets integration with conversations', function () { return __awaiter(void 0, void 0, void 0, function () {
        var conversationId, mockResponse, snippet, retrievedSnippet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, conversationManager.startNewConversation('Snippet Test')];
                case 1:
                    conversationId = (_a.sent()).id;
                    // Add messages to the conversation
                    return [4 /*yield*/, conversationManager.addMessage('user', 'What does this interface do?')];
                case 2:
                    // Add messages to the conversation
                    _a.sent();
                    mockResponse = 'This interface defines a data structure for storing key-value pairs';
                    return [4 /*yield*/, conversationManager.addMessage('assistant', mockResponse)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, snippetManager.createSnippet('Key-Value Interface', [
                            { role: 'user', content: 'What does this interface do?' },
                            { role: 'assistant', content: mockResponse }
                        ], ['interface', 'typescript'], conversationId)];
                case 4:
                    snippet = _a.sent();
                    // Verify the snippet was created correctly
                    assert.strictEqual(snippet.title, 'Key-Value Interface');
                    assert.strictEqual(snippet.messages.length, 2);
                    retrievedSnippet = snippetManager.getSnippet(snippet.id);
                    assert.strictEqual(retrievedSnippet.title, 'Key-Value Interface');
                    return [2 /*return*/];
            }
        });
    }); });
});
