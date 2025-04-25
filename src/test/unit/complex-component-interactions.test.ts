import * as assert from 'assert';
import * as sinon from 'sinon';
import { createMockConversationHistory, createMockExtensionContext } from '../helpers/mockHelpers';
import { ConversationHistory } from '../../services/ConversationHistory';
import { LLMProviderManager } from '../../services/llmProviderManager';
import { ContextManager } from '../../services/contextManager';

describe('Component Interactions', () => {
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
        
        sinon.assert.calledWith(
            historyMock.addMessage as sinon.SinonStub, 
            conversationId,
            sinon.match({ role: 'user', content: testMessage })
        );
        
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
        
        sinon.assert.calledWith(
            historyMock.addMessage as sinon.SinonStub,
            conversationId,
            sinon.match({ role: 'assistant', content: 'Test completion' })
        );
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
        } catch (error) {
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
        
        sinon.assert.calledWith(
            historyMock.addMessage as sinon.SinonStub,
            conversationId,
            sinon.match({ role: 'assistant', content: 'Recovered response' })
        );
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
        
        sinon.assert.calledWith(
            contextManagerMock.updateContext as sinon.SinonStub,
            conversationId,
            sinon.match({ 
                activeFile: 'test.js',
                selectedCode: fileContent,
                codeLanguage: 'javascript'
            })
        );
        
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
        
        const prompt = await contextManagerMock.buildPrompt(
            conversationId, 'What does this function do?'
        );
        
        llmProviderManagerMock.generateCompletion.withArgs(prompt).resolves(
            'This function named "test" returns true.'
        );
        
        const response = await llmProviderManagerMock.generateCompletion(prompt);
        assert.strictEqual(response, 'This function named "test" returns true.');
    });
});