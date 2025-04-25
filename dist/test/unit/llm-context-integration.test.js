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
describe('LLM and Context Integration', () => {
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
    it('should integrate context with LLM generation', async () => {
        const conversationId = 'test-conversation';
        const userPrompt = 'Test user prompt';
        // Setup the conversation
        historyMock.getConversation.returns({
            id: conversationId,
            title: 'Test Conversation',
            messages: [
                { role: 'user', content: 'Initial message', timestamp: Date.now() - 1000 }
            ],
            created: Date.now() - 1000,
            updated: Date.now()
        });
        // Setup context to include file information
        contextManagerMock.buildPrompt.resolves(`
            You are a helpful assistant.
            
            Current file: test.ts
            Selected code: function add(a: number, b: number): number { return a + b; }
            
            User: ${userPrompt}
        `);
        // Build the prompt with context
        const prompt = await contextManagerMock.buildPrompt(conversationId, userPrompt);
        // Generate LLM response
        const response = await llmProviderManagerMock.generateCompletion(prompt);
        // Verify the integration
        sinon.assert.calledWith(contextManagerMock.buildPrompt, conversationId, userPrompt);
        sinon.assert.calledWith(llmProviderManagerMock.generateCompletion, prompt);
        assert.strictEqual(response, 'Test completion');
    });
    it('should handle prompt modifications based on history', async () => {
        const conversationId = 'history-conversation';
        // Setup conversation with history
        historyMock.getConversation.returns({
            id: conversationId,
            title: 'History Test',
            messages: [
                { role: 'user', content: 'What is TypeScript?', timestamp: Date.now() - 3000 },
                { role: 'assistant', content: 'TypeScript is a programming language...', timestamp: Date.now() - 2000 },
                { role: 'user', content: 'How do I use interfaces?', timestamp: Date.now() - 1000 }
            ],
            created: Date.now() - 3000,
            updated: Date.now() - 1000
        });
        // Mock the context manager to include history in the prompt
        contextManagerMock.buildPrompt.callsFake(async (convId, userPrompt) => {
            const conversation = historyMock.getConversation(convId);
            let contextPrompt = 'You are a helpful assistant.\n\n';
            contextPrompt += 'Conversation history:\n';
            conversation.messages.forEach(msg => {
                contextPrompt += `${msg.role}: ${msg.content}\n`;
            });
            contextPrompt += `\nUser: ${userPrompt}`;
            return contextPrompt;
        });
        // Test with a follow-up question
        const followUpPrompt = 'Can you show me an example?';
        const fullPrompt = await contextManagerMock.buildPrompt(conversationId, followUpPrompt);
        // Verify the prompt contains the history
        assert.ok(fullPrompt.includes('What is TypeScript?'));
        assert.ok(fullPrompt.includes('TypeScript is a programming language...'));
        assert.ok(fullPrompt.includes('How do I use interfaces?'));
        assert.ok(fullPrompt.includes('Can you show me an example?'));
        // Generate LLM response
        llmProviderManagerMock.generateCompletion.withArgs(fullPrompt).resolves('Here is an example of a TypeScript interface:\n\ninterface User { id: number; name: string; }');
        const response = await llmProviderManagerMock.generateCompletion(fullPrompt);
        assert.ok(response.includes('interface User'));
    });
    it('should handle token limits by truncating history', async () => {
        const conversationId = 'long-conversation';
        const longHistory = Array.from({ length: 20 }, (_, i) => ({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i}: ${'X'.repeat(100)}`,
            timestamp: Date.now() - (20 - i) * 1000
        }));
        // Setup conversation with long history
        historyMock.getConversation.returns({
            id: conversationId,
            title: 'Long Conversation',
            messages: longHistory,
            created: Date.now() - 20000,
            updated: Date.now()
        });
        // Mock token counting
        llmProviderManagerMock.countTokens = sandbox.stub().callsFake((text) => {
            // Very rough approximation: 1 token per 4 characters
            return Math.ceil(text.length / 4);
        });
        // Mock the context manager to handle token limits
        contextManagerMock.buildPrompt.callsFake(async (convId, userPrompt) => {
            const conversation = historyMock.getConversation(convId);
            const MAX_TOKENS = 1000;
            let contextPrompt = 'You are a helpful assistant.\n\n';
            let tokenCount = llmProviderManagerMock.countTokens(contextPrompt) +
                llmProviderManagerMock.countTokens(userPrompt);
            // Add history from most recent to oldest until we approach the limit
            const includedMessages = [];
            for (let i = conversation.messages.length - 1; i >= 0; i--) {
                const msg = conversation.messages[i];
                const msgTokens = llmProviderManagerMock.countTokens(`${msg.role}: ${msg.content}\n`);
                if (tokenCount + msgTokens < MAX_TOKENS) {
                    includedMessages.unshift(msg);
                    tokenCount += msgTokens;
                }
                else {
                    break;
                }
            }
            contextPrompt += 'Conversation history:\n';
            includedMessages.forEach(msg => {
                contextPrompt += `${msg.role}: ${msg.content}\n`;
            });
            contextPrompt += `\nUser: ${userPrompt}`;
            return contextPrompt;
        });
        // Test with a new question
        const followUpPrompt = 'Summarize our conversation';
        const fullPrompt = await contextManagerMock.buildPrompt(conversationId, followUpPrompt);
        // Verify that not all messages were included due to token limit
        const messagesIncluded = longHistory.filter(msg => fullPrompt.includes(`${msg.role}: ${msg.content}`));
        assert.ok(messagesIncluded.length < longHistory.length);
        assert.ok(fullPrompt.includes('Conversation history'));
        assert.ok(fullPrompt.includes('Summarize our conversation'));
    });
});
//# sourceMappingURL=llm-context-integration.test.js.map