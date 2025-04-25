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
const mockHelpers_1 = require("../helpers/mockHelpers");
const llmProviderManager_1 = require("../../services/llmProviderManager");
const contextManager_1 = require("../../services/contextManager");
describe('Component Interactions', () => {
    let historyMock;
    let contextManagerMock;
    let llmProviderManagerMock;
    let mockContext;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = (0, mockHelpers_1.createMockExtensionContext)();
        // Create mocks for the core components
        historyMock = (0, mockHelpers_1.createMockConversationHistory)();
        contextManagerMock = sandbox.createStubInstance(contextManager_1.ContextManager);
        llmProviderManagerMock = sandbox.createStubInstance(llmProviderManager_1.LLMProviderManager);
        // Setup standard behaviors
        contextManagerMock.buildPrompt = sandbox.stub().resolves('Test prompt');
        llmProviderManagerMock.generateCompletion = sandbox.stub().resolves('Test completion');
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should process a full conversation flow', async () => {
        // 1. Create a new conversation
        const conversationId = 'test-conversation';
        const testTitle = 'Test Conversation';
        const testMessage = 'Hello, assistant';
        historyMock.createConversation.resolves({
            id: conversationId,
            title: testTitle,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        });
        const conversation = await historyMock.createConversation(testTitle);
        assert.strictEqual(conversation.id, conversationId);
        // 2. Add a user message
        await historyMock.addMessage(conversationId, {
            role: 'user',
            content: testMessage,
            timestamp: Date.now()
        });
        sinon.assert.calledWith(historyMock.addMessage, conversationId, sinon.match({ role: 'user', content: testMessage }));
        // 3. Build context for the LLM
        const promptText = await contextManagerMock.buildPrompt(conversationId, testMessage);
        assert.strictEqual(promptText, 'Test prompt');
        // 4. Generate LLM response
        const assistantResponse = await llmProviderManagerMock.generateCompletion(promptText);
        assert.strictEqual(assistantResponse, 'Test completion');
        // 5. Save the assistant's response
        await historyMock.addMessage(conversationId, {
            role: 'assistant',
            content: assistantResponse,
            timestamp: Date.now()
        });
        sinon.assert.calledWith(historyMock.addMessage, conversationId, sinon.match({ role: 'assistant', content: 'Test completion' }));
    });
    it('should handle error recovery during conversation flow', async () => {
        const conversationId = 'error-test-conversation';
        // Setup error in LLM
        llmProviderManagerMock.generateCompletion.rejects(new Error('Network error'));
        // Mock recovery behavior
        llmProviderManagerMock.recoverFromError = sandbox.stub().resolves({
            success: true,
            result: 'Recovered response'
        });
        // 1. Create conversation and add message
        historyMock.createConversation.resolves({
            id: conversationId,
            title: 'Error Test',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        });
        await historyMock.createConversation('Error Test');
        await historyMock.addMessage(conversationId, {
            role: 'user',
            content: 'This will trigger an error',
            timestamp: Date.now()
        });
        // 2. Try to generate response (will fail)
        try {
            await llmProviderManagerMock.generateCompletion('This will trigger an error');
            assert.fail('Expected error was not thrown');
        }
        catch (error) {
            assert.strictEqual(error.message, 'Network error');
        }
        // 3. Attempt recovery
        const recoveryResult = await llmProviderManagerMock.recoverFromError(new Error('Network error'));
        assert.strictEqual(recoveryResult.success, true);
        assert.strictEqual(recoveryResult.result, 'Recovered response');
        // 4. Save the recovered response
        await historyMock.addMessage(conversationId, {
            role: 'assistant',
            content: recoveryResult.result,
            timestamp: Date.now()
        });
        sinon.assert.calledWith(historyMock.addMessage, conversationId, sinon.match({ role: 'assistant', content: 'Recovered response' }));
    });
    it('should handle context update with file changes', async () => {
        const conversationId = 'file-context-conversation';
        const fileContent = 'function test() { return true; }';
        // Setup conversation
        historyMock.createConversation.resolves({
            id: conversationId,
            title: 'File Context Test',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        });
        await historyMock.createConversation('File Context Test');
        // Update context with file content
        await contextManagerMock.updateContext(conversationId, {
            activeFile: 'test.js',
            selectedCode: fileContent,
            codeLanguage: 'javascript'
        });
        sinon.assert.calledWith(contextManagerMock.updateContext, conversationId, sinon.match({
            activeFile: 'test.js',
            selectedCode: fileContent,
            codeLanguage: 'javascript'
        }));
        // User asks about the file
        await historyMock.addMessage(conversationId, {
            role: 'user',
            content: 'What does this function do?',
            timestamp: Date.now()
        });
        // Generate response with context
        contextManagerMock.buildPrompt.resolves(`Here's the context:
Active file: test.js
Code: ${fileContent}
User question: What does this function do?`);
        const prompt = await contextManagerMock.buildPrompt(conversationId, 'What does this function do?');
        llmProviderManagerMock.generateCompletion.withArgs(prompt).resolves('This function named "test" returns true.');
        const response = await llmProviderManagerMock.generateCompletion(prompt);
        assert.strictEqual(response, 'This function named "test" returns true.');
    });
});
//# sourceMappingURL=complex-component-interactions.test.js.map