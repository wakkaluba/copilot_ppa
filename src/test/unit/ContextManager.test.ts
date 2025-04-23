import * as assert from 'assert';
import * as sinon from 'sinon';
import { ContextManager, Context } from '../../services/ContextManager';
import { ConversationHistory } from '../../services/ConversationHistory';
import { ConversationManager } from '../../services/ConversationManager';
import { PromptManager } from '../../services/PromptManager';

suite('ContextManager', () => {
    // Test suite organization
    let contextManager: ContextManager;
    let historyStub: sinon.SinonStubbedInstance<ConversationHistory>;
    let conversationManagerStub: sinon.SinonStubbedInstance<ConversationManager>;
    let promptManagerStub: sinon.SinonStubbedInstance<PromptManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        historyStub = sandbox.createStubInstance(ConversationHistory);
        conversationManagerStub = sandbox.createStubInstance(ConversationManager);
        promptManagerStub = sandbox.createStubInstance(PromptManager);
        
        sandbox.stub(ConversationManager, 'getInstance').returns(conversationManagerStub as unknown as ConversationManager);
        sandbox.stub(PromptManager, 'getInstance').returns(promptManagerStub as unknown as PromptManager);
        
        contextManager = ContextManager.getInstance(historyStub as unknown as ConversationHistory);
    });

    teardown(() => {
        sandbox.restore();
        // Ensure cleanup of any remaining contexts
        contextManager.clearAllContextData();
    });

    suite('Instance Management', () => {
        test('getInstance returns singleton instance', () => {
            const instance1 = ContextManager.getInstance(historyStub as unknown as ConversationHistory);
            const instance2 = ContextManager.getInstance(historyStub as unknown as ConversationHistory);
            assert.strictEqual(instance1, instance2, 'Multiple instances were created');
        });

        test('getInstance with different history maintains singleton', () => {
            const newHistoryStub = sandbox.createStubInstance(ConversationHistory);
            const instance = ContextManager.getInstance(newHistoryStub as unknown as ConversationHistory);
            assert.strictEqual(instance, contextManager, 'New instance created with different history');
        });
    });

    suite('Context Creation and Management', () => {
        test('createContext initializes with default values', () => {
            const conversationId = 'test_conversation';
            const context = contextManager.createContext(conversationId);
            
            assert.strictEqual(context.conversationId, conversationId);
            assert.deepStrictEqual(context.relevantFiles, []);
            assert.ok(context.systemPrompt.includes('VS Code extension assistant'));
            assert.ok(context.created instanceof Date);
            assert.ok(context.updated instanceof Date);
        });

        test('createContext with existing ID throws error', () => {
            const conversationId = 'duplicate_test';
            contextManager.createContext(conversationId);
            
            assert.throws(() => {
                contextManager.createContext(conversationId);
            }, /Context already exists/);
        });

        test('updateContext modifies existing context', () => {
            const conversationId = 'update_test';
            const initialContext = contextManager.createContext(conversationId);
            
            const updates = {
                activeFile: 'test.ts',
                selectedCode: 'console.log("Hello");',
                codeLanguage: 'typescript'
            };
            
            contextManager.updateContext(conversationId, updates);
            const updatedContext = contextManager.getContext(conversationId);
            
            assert.strictEqual(updatedContext.activeFile, updates.activeFile);
            assert.strictEqual(updatedContext.selectedCode, updates.selectedCode);
            assert.strictEqual(updatedContext.codeLanguage, updates.codeLanguage);
            assert.ok(updatedContext.updated > initialContext.updated);
        });

        test('updateContext with invalid updates maintains existing values', () => {
            const conversationId = 'invalid_update_test';
            const initialContext = contextManager.createContext(conversationId);
            
            contextManager.updateContext(conversationId, { 
                invalidProperty: 'test' 
            } as any);
            
            const context = contextManager.getContext(conversationId);
            assert.deepStrictEqual(context.relevantFiles, initialContext.relevantFiles);
            assert.strictEqual(context.systemPrompt, initialContext.systemPrompt);
        });
    });

    suite('Context Window Management', () => {
        test('updateContext adds message to context window with relevance', async () => {
            const conversationId = 'window_test';
            await contextManager.updateContext(conversationId, 'Test message', 0.9);
            
            const contextWindows = (contextManager as any).contextWindows;
            const window = contextWindows.get(conversationId);
            
            assert.ok(window);
            assert.strictEqual(window.messages.length, 1);
            assert.strictEqual(window.messages[0], 'Test message');
            assert.strictEqual(window.relevance, 0.9);
        });

        test('context window respects max size limit', async () => {
            const conversationId = 'window_size_test';
            contextManager.setMaxWindowSize(3);
            
            await contextManager.updateContext(conversationId, 'Message 1', 0.5);
            await contextManager.updateContext(conversationId, 'Message 2', 0.6);
            await contextManager.updateContext(conversationId, 'Message 3', 0.7);
            await contextManager.updateContext(conversationId, 'Message 4', 0.8);
            
            const contextWindows = (contextManager as any).contextWindows;
            const window = contextWindows.get(conversationId);
            
            assert.strictEqual(window.messages.length, 3);
            assert.strictEqual(window.messages[0], 'Message 2');
            assert.strictEqual(window.messages[2], 'Message 4');
        });
    });

    suite('Prompt Building', () => {
        test('buildPrompt incorporates all context elements', async () => {
            const conversationId = 'prompt_test';
            
            contextManager.createContext(conversationId);
            contextManager.updateContext(conversationId, {
                activeFile: 'test.ts',
                selectedCode: 'function add(a, b) { return a + b; }',
                codeLanguage: 'typescript'
            });
            
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
            
            assert.ok(prompt.includes('Current file: test.ts'));
            assert.ok(prompt.includes('Selected code:'));
            assert.ok(prompt.includes('function add(a, b) { return a + b; }'));
            assert.ok(prompt.includes('User: Help me understand this code'));
            assert.ok(prompt.includes('Assistant: This is a function that adds two numbers'));
            assert.ok(prompt.includes('User: What does this function do?'));
        });

        test('buildPrompt handles missing context gracefully', async () => {
            const conversationId = 'missing_context_test';
            
            historyStub.getConversation.returns(null);
            
            const prompt = await contextManager.buildPrompt(conversationId, 'Test prompt');
            
            assert.ok(prompt.includes('User: Test prompt'));
            assert.ok(!prompt.includes('Current file:'));
            assert.ok(!prompt.includes('Selected code:'));
        });
    });

    suite('Language and Framework Detection', () => {
        test('analyzeMessage detects TypeScript and React', () => {
            const message = {
                role: 'user',
                content: 'Help me write a React component in TypeScript',
                timestamp: Date.now()
            };
            
            contextManager.addMessage(message);
            
            assert.strictEqual(contextManager.getPreferredLanguage(), 'typescript');
            assert.strictEqual(contextManager.getPreferredFramework(), 'react');
        });

        test('analyzeMessage detects Python and Django', () => {
            const message = {
                role: 'user',
                content: 'How do I create a Django model in Python?',
                timestamp: Date.now()
            };
            
            contextManager.addMessage(message);
            
            assert.strictEqual(contextManager.getPreferredLanguage(), 'python');
            assert.strictEqual(contextManager.getPreferredFramework(), 'django');
        });

        test('analyzeMessage maintains last detected preferences', () => {
            const message1 = {
                role: 'user',
                content: 'Help with TypeScript',
                timestamp: Date.now()
            };
            
            const message2 = {
                role: 'user',
                content: 'General question',
                timestamp: Date.now()
            };
            
            contextManager.addMessage(message1);
            contextManager.addMessage(message2);
            
            assert.strictEqual(contextManager.getPreferredLanguage(), 'typescript');
        });
    });

    suite('Cleanup and Resource Management', () => {
        test('clearAllContextData resets all state', async () => {
            const conversationId = 'cleanup_test';
            await contextManager.updateContext(conversationId, 'Test message', 0.9);
            contextManager.addMessage({ 
                role: 'user',
                content: 'Test message',
                timestamp: Date.now()
            });
            
            await contextManager.clearAllContextData();
            
            assert.strictEqual(contextManager.getConversationHistory().length, 0);
            assert.strictEqual(contextManager.getPreferredLanguage(), undefined);
            assert.strictEqual(contextManager.getPreferredFramework(), undefined);
            assert.strictEqual((contextManager as any).contextWindows.size, 0);
        });

        test('old messages are cleaned up correctly', async () => {
            const now = Date.now();
            const oldMessage = { 
                role: 'user',
                content: 'Old message',
                timestamp: now - 1000000 
            };
            const recentMessage = { 
                role: 'user',
                content: 'Recent message',
                timestamp: now - 1000 
            };
            
            contextManager.addMessage(oldMessage);
            contextManager.addMessage(recentMessage);
            
            await contextManager.cleanupOldMessages(now - 5000);
            
            const history = contextManager.getConversationHistory(10);
            assert.strictEqual(history.length, 1);
            assert.deepStrictEqual(history[0], recentMessage);
        });
    });
});