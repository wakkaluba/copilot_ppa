"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const ContextManager_1 = require("../../services/ContextManager");
const ConversationHistory_1 = require("../../services/ConversationHistory");
const ConversationManager_1 = require("../../services/ConversationManager");
const PromptManager_1 = require("../../services/PromptManager");
suite('ContextManager Tests', () => {
    let contextManager;
    let historyStub;
    let conversationManagerStub;
    let promptManagerStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Create stubs for dependencies
        historyStub = sandbox.createStubInstance(ConversationHistory_1.ConversationHistory);
        conversationManagerStub = sandbox.createStubInstance(ConversationManager_1.ConversationManager);
        promptManagerStub = sandbox.createStubInstance(PromptManager_1.PromptManager);
        // Replace the getInstance methods
        sandbox.stub(ConversationManager_1.ConversationManager, 'getInstance').returns(conversationManagerStub);
        sandbox.stub(PromptManager_1.PromptManager, 'getInstance').returns(promptManagerStub);
        // Create instance of ContextManager
        contextManager = ContextManager_1.ContextManager.getInstance(historyStub);
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = ContextManager_1.ContextManager.getInstance(historyStub);
        const instance2 = ContextManager_1.ContextManager.getInstance(historyStub);
        assert.strictEqual(instance1, instance2);
    });
    test('createContext should initialize a new context with default values', () => {
        const conversationId = 'test_conversation';
        const context = contextManager.createContext(conversationId);
        assert.strictEqual(context.conversationId, conversationId);
        assert.deepStrictEqual(context.relevantFiles, []);
        assert.ok(context.systemPrompt.includes('You are a helpful VS Code extension assistant'));
    });
    test('updateContext should modify an existing context', () => {
        const conversationId = 'test_conversation';
        contextManager.createContext(conversationId);
        contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'console.log("Hello");',
            codeLanguage: 'typescript'
        });
        const context = contextManager.getContext(conversationId);
        assert.strictEqual(context.activeFile, 'test.ts');
        assert.strictEqual(context.selectedCode, 'console.log("Hello");');
        assert.strictEqual(context.codeLanguage, 'typescript');
    });
    test('updateContext should throw error for non-existent context', () => {
        assert.throws(() => {
            contextManager.updateContext('nonexistent_id', {
                activeFile: 'test.ts'
            });
        }, /Context not found/);
    });
    test('getContext should create a new context if it does not exist', () => {
        const conversationId = 'new_conversation';
        const context = contextManager.getContext(conversationId);
        assert.strictEqual(context.conversationId, conversationId);
        assert.ok(context.systemPrompt.includes('VS Code extension assistant'));
    });
    test('buildPrompt should incorporate context into the prompt', async () => {
        const conversationId = 'test_conversation';
        // Create a context with specific values
        contextManager.createContext(conversationId);
        contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'function add(a, b) { return a + b; }',
            codeLanguage: 'typescript'
        });
        // Mock conversation history
        historyStub.getConversation.returns({
            id: conversationId,
            title: "Test Conversation",
            created: Date.now(),
            updated: Date.now(),
            messages: [
                { role: 'user', content: 'Help me understand this code', timestamp: Date.now() },
                { role: 'assistant', content: 'This is a function that adds two numbers', timestamp: Date.now() }
            ]
        });
        const prompt = await contextManager.buildPrompt(conversationId, 'What does this function do?');
        // Verify the prompt contains the expected elements
        assert.ok(prompt.includes('Current file: test.ts'));
        assert.ok(prompt.includes('Selected code:'));
        assert.ok(prompt.includes('function add(a, b) { return a + b; }'));
        assert.ok(prompt.includes('User: Help me understand this code'));
        assert.ok(prompt.includes('Assistant: This is a function that adds two numbers'));
        assert.ok(prompt.includes('User: What does this function do?'));
        assert.ok(prompt.includes('Assistant: '));
    });
    test('buildContext should combine history and relevant context', async () => {
        const conversationId = 'test_conversation';
        // Setup mocks
        conversationManagerStub.getCurrentContext.returns([
            { role: 'user', content: 'Previous message', timestamp: Date.now() }
        ]);
        // Manually set a private property using any type assertion
        contextManager.contextWindows = new Map([
            [conversationId, {
                    messages: ['Relevant context 1', 'Relevant context 2'],
                    relevance: 0.8,
                    timestamp: Date.now()
                }]
        ]);
        const context = await contextManager.buildContext(conversationId, 'Current prompt');
        // Should include both the relevant context and the conversation history
        assert.strictEqual(context.length, 3);
        assert.ok(context.includes('Relevant context 1'));
        assert.ok(context.includes('Relevant context 2'));
        assert.ok(context.includes('Previous message'));
    });
    test('setMaxWindowSize should update the window size setting', () => {
        contextManager.setMaxWindowSize(20);
        // Verify the property was set (using any to access private property)
        assert.strictEqual(contextManager.maxWindowSize, 20);
    });
    test('setRelevanceThreshold should update the relevance threshold', () => {
        contextManager.setRelevanceThreshold(0.75);
        // Verify the property was set (using any to access private property)
        assert.strictEqual(contextManager.relevanceThreshold, 0.75);
    });
    test('updateContext should add message to context window', async () => {
        const conversationId = 'test_conversation';
        await contextManager.updateContext(conversationId, 'Test message', 0.9);
        // Get the private property
        const contextWindows = contextManager.contextWindows;
        const window = contextWindows.get(conversationId);
        assert.ok(window);
        assert.strictEqual(window.messages.length, 1);
        assert.strictEqual(window.messages[0], 'Test message');
        assert.strictEqual(window.relevance, 0.9);
    });
    test('updateContext should limit messages to max window size', async () => {
        const conversationId = 'test_conversation';
        // Set window size to 3
        contextManager.setMaxWindowSize(3);
        // Add 5 messages
        await contextManager.updateContext(conversationId, 'Message 1', 0.5);
        await contextManager.updateContext(conversationId, 'Message 2', 0.6);
        await contextManager.updateContext(conversationId, 'Message 3', 0.7);
        await contextManager.updateContext(conversationId, 'Message 4', 0.8);
        await contextManager.updateContext(conversationId, 'Message 5', 0.9);
        // Get the private property
        const contextWindows = contextManager.contextWindows;
        const window = contextWindows.get(conversationId);
        // Should only keep the most recent 3 messages
        assert.strictEqual(window.messages.length, 3);
        assert.strictEqual(window.messages[0], 'Message 3');
        assert.strictEqual(window.messages[1], 'Message 4');
        assert.strictEqual(window.messages[2], 'Message 5');
    });
});
//# sourceMappingURL=ContextManager.test.js.map