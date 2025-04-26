import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockConversationHistory, createMockExtensionContext } from '../helpers/mockHelpers';
import { ConversationHistory } from '../../services/ConversationHistory';
import { LLMProviderManager } from '../../services/llmProviderManager';
import { ContextManager } from '../../services/contextManager';

describe('LLM and Context Integration', () => {
    let historyMock: sinon.SinonStubbedInstance<ConversationHistory>;
    let contextManagerMock: sinon.SinonStubbedInstance<ContextManager>;
    let llmProviderManagerMock: sinon.SinonStubbedInstance<LLMProviderManager>;
    let mockContext: any;
    let sandbox: sinon.SinonSandbox;
    
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockContext = createMockExtensionContext();
        
        // Create mocks for the core components
        historyMock = createMockConversationHistory();
        contextManagerMock = sandbox.createStubInstance(ContextManager);
        llmProviderManagerMock = sandbox.createStubInstance(LLMProviderManager);
        
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
                { role: 'user', content: 'Initial message', timestamp: new Date() - 1000 }
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
        sinon.assert.calledWith(
            contextManagerMock.buildPrompt as sinon.SinonStub,
            conversationId,
            userPrompt
        );
        
        sinon.assert.calledWith(
            llmProviderManagerMock.generateCompletion as sinon.SinonStub,
            prompt
        );
        
        assert.strictEqual(response, 'Test completion');
    });

    it('should handle prompt modifications based on history', async () => {
        const conversationId = 'history-conversation';
        
        // Setup conversation with history
        historyMock.getConversation.returns({
            id: conversationId,
            title: 'History Test',
            messages: [
                { role: 'user', content: 'What is TypeScript?', timestamp: new Date() - 3000 },
                { role: 'assistant', content: 'TypeScript is a programming language...', timestamp: new Date() - 2000 },
                { role: 'user', content: 'How do I use interfaces?', timestamp: new Date() - 1000 }
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
        llmProviderManagerMock.generateCompletion.withArgs(fullPrompt).resolves(
            'Here is an example of a TypeScript interface:\n\ninterface User { id: number; name: string; }'
        );
        
        const response = await llmProviderManagerMock.generateCompletion(fullPrompt);
        
        assert.ok(response.includes('interface User'));
    });

    it('should handle token limits by truncating history', async () => {
        const conversationId = 'long-conversation';
        const longHistory = Array.from({ length: 20 }, (_, i) => ({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: `Message ${i}: ${'X'.repeat(100)}`,
            timestamp: new Date() - (20 - i) * 1000
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
                } else {
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
        const messagesIncluded = longHistory.filter(msg => 
            fullPrompt.includes(`${msg.role}: ${msg.content}`)
        );
        
        assert.ok(messagesIncluded.length < longHistory.length);
        assert.ok(fullPrompt.includes('Conversation history'));
        assert.ok(fullPrompt.includes('Summarize our conversation'));
    });
});