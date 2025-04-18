import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/ConversationManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ModelManager } from '../../src/models/modelManager';

describe('Complex Component Interactions', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let llmProviderManager: LLMProviderManager;
    let modelManager: ModelManager;
    let history: ConversationHistory;

    beforeEach(async () => {
        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: '/test/path',
            storagePath: '/test/storage'
        } as any as vscode.ExtensionContext;

        history = new ConversationHistory(context);
        await history.initialize();
        
        contextManager = ContextManager.getInstance(history);
        conversationManager = ConversationManager.getInstance();
        llmProviderManager = LLMProviderManager.getInstance();
        modelManager = new ModelManager();
    });

    test('maintains context across model switches', async () => {
        // Initialize conversation with context
        const conversationId = 'test-conversation';
        await conversationManager.startNewConversation('Test Conversation');
        
        // Set initial context with TypeScript code
        contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'interface User { name: string; age: number; }',
            codeLanguage: 'typescript'
        });

        // Get response from first model
        const model1Response = await llmProviderManager.getActiveProvider()?.generateCompletion(
            'model1',
            await contextManager.buildPrompt(conversationId, 'What is this interface for?'),
            undefined,
            { temperature: 0.7 }
        );

        // Switch models
        await modelManager.switchModel('model2');

        // Get response from second model
        const model2Response = await llmProviderManager.getActiveProvider()?.generateCompletion(
            'model2',
            await contextManager.buildPrompt(conversationId, 'What are the properties of this interface?'),
            undefined,
            { temperature: 0.7 }
        );

        // Verify both responses reference the interface
        assert.ok(model1Response?.content.toLowerCase().includes('user'));
        assert.ok(model2Response?.content.toLowerCase().includes('name'));
        assert.ok(model2Response?.content.toLowerCase().includes('age'));
    });

    test('handles concurrent context updates during streaming', async () => {
        const conversationId = 'test-conversation-2';
        await conversationManager.startNewConversation('Test Conversation 2');

        // Start a streaming response
        const streamedContent: string[] = [];
        const streamPromise = llmProviderManager.getActiveProvider()?.streamCompletion(
            'model1',
            await contextManager.buildPrompt(conversationId, 'Explain programming concepts'),
            undefined,
            { temperature: 0.7 },
            (event) => {
                streamedContent.push(event.content);
            }
        );

        // Update context while streaming
        await Promise.all([
            streamPromise,
            (async () => {
                // Wait a bit to let streaming start
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Update context multiple times
                await contextManager.updateContext(conversationId, {
                    activeFile: 'example1.ts',
                    selectedCode: 'function test1() {}',
                    codeLanguage: 'typescript'
                });
                
                await contextManager.updateContext(conversationId, {
                    activeFile: 'example2.ts',
                    selectedCode: 'function test2() {}',
                    codeLanguage: 'typescript'
                });
            })()
        ]);

        // Verify stream completed and context updates were maintained
        assert.ok(streamedContent.length > 0);
        const context = contextManager.getContext(conversationId);
        assert.strictEqual(context.activeFile, 'example2.ts');
        assert.strictEqual(context.selectedCode, 'function test2() {}');
    });

    test('preserves conversation history across component restarts', async () => {
        // Create initial conversation with messages
        const conversationId = 'test-conversation-3';
        await conversationManager.startNewConversation('Test Conversation 3');
        
        await conversationManager.addMessage('user', 'What is TypeScript?');
        await conversationManager.addMessage('assistant', 'TypeScript is a typed superset of JavaScript.');
        
        // Simulate component restart by recreating instances
        const newHistory = new ConversationHistory(history.context);
        await newHistory.initialize();
        
        const newContextManager = ContextManager.getInstance(newHistory);
        const newConversationManager = ConversationManager.getInstance();
        
        // Load conversation
        await newConversationManager.loadConversation(conversationId);
        
        // Verify history was preserved
        const context = newConversationManager.getCurrentContext();
        assert.strictEqual(context.length, 2);
        assert.strictEqual(context[0].content, 'What is TypeScript?');
        assert.strictEqual(context[1].content, 'TypeScript is a typed superset of JavaScript.');
    });

    test('handles memory pressure during large context operations', async () => {
        const conversationId = 'test-conversation-4';
        await conversationManager.startNewConversation('Test Conversation 4');

        // Create large context
        const largeCode = 'interface Test {\n' + Array(1000).fill('  field: string;').join('\n') + '\n}';
        
        const startHeap = process.memoryUsage().heapUsed;
        
        // Perform multiple context operations
        for (let i = 0; i < 10; i++) {
            await contextManager.updateContext(conversationId, {
                activeFile: `test${i}.ts`,
                selectedCode: largeCode,
                codeLanguage: 'typescript'
            });

            const prompt = await contextManager.buildPrompt(conversationId, 'What does this interface do?');
            assert.ok(prompt.includes('interface Test'));
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        const endHeap = process.memoryUsage().heapUsed;
        const heapGrowth = endHeap - startHeap;
        
        // Verify memory growth is reasonable (less than 50MB)
        assert.ok(heapGrowth < 50 * 1024 * 1024, `Memory growth ${heapGrowth} bytes exceeds threshold`);
    });
});

// Mock implementation of vscode.Memento for testing
class MockMemento implements vscode.Memento {
    private storage = new Map<string, any>();

    get<T>(key: string): T | undefined;
    get<T>(key: string, defaultValue: T): T;
    get(key: string, defaultValue?: any) {
        return this.storage.has(key) ? this.storage.get(key) : defaultValue;
    }

    update(key: string, value: any): Thenable<void> {
        this.storage.set(key, value);
        return Promise.resolve();
    }
}