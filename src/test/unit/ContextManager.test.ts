import * as assert from 'assert';
import * as sinon from 'sinon';
import { ContextManager, Context } from '../../services/ContextManager';
import { ConversationHistory } from '../../services/ConversationHistory';
import { ConversationManager } from '../../services/ConversationManager';
import { PromptManager } from '../../services/PromptManager';

suite('ContextManager Tests', () => {
    let contextManager: ContextManager;
    let historyStub: sinon.SinonStubbedInstance<ConversationHistory>;
    let conversationManagerStub: sinon.SinonStubbedInstance<ConversationManager>;
    let promptManagerStub: sinon.SinonStubbedInstance<PromptManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create stubs for dependencies
        historyStub = sandbox.createStubInstance(ConversationHistory);
        conversationManagerStub = sandbox.createStubInstance(ConversationManager);
        promptManagerStub = sandbox.createStubInstance(PromptManager);
        
        // Replace the getInstance methods
        sandbox.stub(ConversationManager, 'getInstance').returns(conversationManagerStub as unknown as ConversationManager);
        sandbox.stub(PromptManager, 'getInstance').returns(promptManagerStub as unknown as PromptManager);
        
        // Create instance of ContextManager
        contextManager = ContextManager.getInstance(historyStub as unknown as ConversationHistory);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = ContextManager.getInstance(historyStub as unknown as ConversationHistory);
        const instance2 = ContextManager.getInstance(historyStub as unknown as ConversationHistory);
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
        (contextManager as any).contextWindows = new Map([
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
        assert.strictEqual((contextManager as any).maxWindowSize, 20);
    });

    test('setRelevanceThreshold should update the relevance threshold', () => {
        contextManager.setRelevanceThreshold(0.75);
        
        // Verify the property was set (using any to access private property)
        assert.strictEqual((contextManager as any).relevanceThreshold, 0.75);
    });

    test('updateContext should add message to context window', async () => {
        const conversationId = 'test_conversation';
        await contextManager.updateContext(conversationId, 'Test message', 0.9);
        
        // Get the private property
        const contextWindows = (contextManager as any).contextWindows;
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
        const contextWindows = (contextManager as any).contextWindows;
        const window = contextWindows.get(conversationId);
        
        // Should only keep the most recent 3 messages
        assert.strictEqual(window.messages.length, 3);
        assert.strictEqual(window.messages[0], 'Message 3');
        assert.strictEqual(window.messages[1], 'Message 4');
        assert.strictEqual(window.messages[2], 'Message 5');
    });

    test('clearAllContextData should reset all context data', async () => {
        // Set up some initial context
        const conversationId = 'test_conversation';
        await contextManager.updateContext(conversationId, 'Test message', 0.9);
        
        // Clear all context
        await contextManager.clearAllContextData();
        
        // Verify conversation memory is cleared
        const history = contextManager.getConversationHistory();
        assert.strictEqual(history.length, 0);
        
        // Verify user preferences are cleared
        assert.strictEqual(contextManager.getPreferredLanguage(), undefined);
        assert.strictEqual(contextManager.getPreferredFramework(), undefined);
    });

    test('analyzeMessage should properly extract language and framework preferences', () => {
        // Test with typescript and react
        const tsReactMessage = {
            role: 'user',
            content: 'Help me write a React component in TypeScript',
            timestamp: Date.now()
        };
        contextManager.addMessage(tsReactMessage);
        
        assert.strictEqual(contextManager.getPreferredLanguage(), 'typescript');
        assert.strictEqual(contextManager.getPreferredFramework(), 'react');

        // Test with python and django
        const pythonDjangoMessage = {
            role: 'user',
            content: 'How do I create a Django model in Python?',
            timestamp: Date.now()
        };
        contextManager.addMessage(pythonDjangoMessage);
        
        assert.strictEqual(contextManager.getPreferredLanguage(), 'python');
        assert.strictEqual(contextManager.getPreferredFramework(), 'django');
    });

    test('getMessagesByDateRange should return messages within specified timeframe', () => {
        const now = Date.now();
        const messages = [
            { role: 'user', content: 'Message 1', timestamp: now - 3000 },
            { role: 'assistant', content: 'Response 1', timestamp: now - 2000 },
            { role: 'user', content: 'Message 2', timestamp: now - 1000 },
            { role: 'assistant', content: 'Response 2', timestamp: now }
        ];

        // Add messages
        messages.forEach(msg => contextManager.addMessage(msg));

        // Get messages from last 2 seconds
        const recentMessages = (contextManager as any).conversationMemory
            .getMessagesByDateRange(now - 2000, now);

        assert.strictEqual(recentMessages.length, 2);
        assert.strictEqual(recentMessages[0].content, 'Message 2');
        assert.strictEqual(recentMessages[1].content, 'Response 2');
    });

    test('searchMessages should find messages containing search term', () => {
        const messages = [
            { role: 'user', content: 'Help with TypeScript', timestamp: Date.now() },
            { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript', timestamp: Date.now() },
            { role: 'user', content: 'How to use React hooks?', timestamp: Date.now() }
        ];

        // Add messages
        messages.forEach(msg => contextManager.addMessage(msg));

        // Search for TypeScript-related messages
        const typeScriptMessages = (contextManager as any).conversationMemory
            .searchMessages('typescript');

        assert.strictEqual(typeScriptMessages.length, 2);
        assert.ok(typeScriptMessages.every(msg => 
            msg.content.toLowerCase().includes('typescript')));
    });

    test('context should persist message history correctly', async () => {
        const messages = [
            { id: 'msg1', role: 'user', content: 'Hello', timestamp: Date.now() - 2000 },
            { id: 'msg2', role: 'assistant', content: 'Hi there', timestamp: Date.now() - 1000 }
        ];
        
        contextManager.addMessage(messages[0]);
        contextManager.addMessage(messages[1]);
        
        const history = contextManager.getConversationHistory(10);
        assert.strictEqual(history.length, 2);
        assert.deepStrictEqual(history[0], messages[0]);
        assert.deepStrictEqual(history[1], messages[1]);
    });

    test('context cleanup should remove old messages while preserving recent ones', async () => {
        const now = Date.now();
        const oldMessage = { id: 'old', role: 'user', content: 'Old message', timestamp: now - 1000000 };
        const recentMessage = { id: 'recent', role: 'user', content: 'Recent message', timestamp: now - 1000 };
        
        contextManager.addMessage(oldMessage);
        contextManager.addMessage(recentMessage);
        
        await contextManager.cleanupOldMessages(now - 5000);
        
        const history = contextManager.getConversationHistory(10);
        assert.strictEqual(history.length, 1);
        assert.deepStrictEqual(history[0], recentMessage);
    });

    test('buildContextString should include relevant context information', () => {
        contextManager.addMessage({ 
            id: 'msg1',
            role: 'user', 
            content: 'How do I use TypeScript with React?', 
            timestamp: Date.now() 
        });

        const contextString = contextManager.buildContextString();
        assert.ok(contextString.includes('typescript'));
        assert.ok(contextString.includes('react'));
    });

    test('context should handle language and framework preferences', () => {
        contextManager.addMessage({ 
            id: 'msg1',
            role: 'user', 
            content: 'I want to build a TypeScript React application', 
            timestamp: Date.now() 
        });

        assert.strictEqual(contextManager.getPreferredLanguage(), 'typescript');
        assert.strictEqual(contextManager.getPreferredFramework(), 'react');
    });
});