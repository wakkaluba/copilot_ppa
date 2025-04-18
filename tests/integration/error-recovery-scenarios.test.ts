import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/ConversationManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ModelManager } from '../../src/models/modelManager';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';

describe('Error Recovery Scenarios', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let llmProviderManager: LLMProviderManager;
    let modelManager: ModelManager;
    let workspaceManager: WorkspaceManager;
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
        workspaceManager = WorkspaceManager.getInstance();
    });

    test('recovers from provider disconnection', async () => {
        const conversationId = 'error-test-1';
        await conversationManager.startNewConversation('Error Test 1');

        // Set up initial context
        await contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'function add(a: number, b: number): number { return a + b; }',
            codeLanguage: 'typescript'
        });

        // Force provider disconnect
        const provider = llmProviderManager.getActiveProvider();
        await provider?.disconnect();

        // Attempt to use provider - should trigger auto-reconnect
        const response = await provider?.generateCompletion(
            'model1',
            await contextManager.buildPrompt(conversationId, 'What does this function do?'),
            undefined,
            { temperature: 0.7 }
        );

        // Verify response was received after recovery
        assert.ok(response?.content);
        assert.ok(provider?.isConnected());
    });

    test('maintains conversation state during file system errors', async () => {
        const conversationId = 'error-test-2';
        await conversationManager.startNewConversation('Error Test 2');

        // Add some messages
        await conversationManager.addMessage('user', 'Test message 1');
        await conversationManager.addMessage('assistant', 'Test response 1');

        // Simulate file system error during save
        const originalWriteFile = workspaceManager.writeFile;
        let retryCount = 0;
        workspaceManager.writeFile = async (path: string, content: string) => {
            if (retryCount === 0) {
                retryCount++;
                throw new Error('Simulated file system error');
            }
            return originalWriteFile.call(workspaceManager, path, content);
        };

        // Try to add another message - should retry after error
        await conversationManager.addMessage('user', 'Test message 2');

        // Verify all messages were preserved
        const context = conversationManager.getCurrentContext();
        assert.strictEqual(context.length, 3);
        assert.strictEqual(context[2].content, 'Test message 2');

        // Restore original writeFile
        workspaceManager.writeFile = originalWriteFile;
    });

    test('recovers from concurrent model loading failures', async () => {
        // Attempt to load multiple models concurrently
        const loadAttempts = Array(5).fill(null).map((_, i) => 
            modelManager.switchModel(`model${i + 1}`)
                .catch(error => ({ error }))
        );

        const results = await Promise.all(loadAttempts);
        
        // At least one model should load successfully
        const successfulLoads = results.filter(result => !result.error);
        assert.ok(successfulLoads.length > 0, 'No models loaded successfully');

        // System should remain in a usable state
        const activeModel = modelManager.getActiveModel();
        assert.ok(activeModel, 'No active model available after concurrent load attempts');
    });

    test('handles streaming interruptions gracefully', async () => {
        const conversationId = 'error-test-4';
        await conversationManager.startNewConversation('Error Test 4');

        let streamingContent = '';
        let streamingError: Error | undefined;
        
        // Start streaming with simulated interruption
        const streamPromise = llmProviderManager.getActiveProvider()?.streamCompletion(
            'model1',
            await contextManager.buildPrompt(conversationId, 'Generate a long response'),
            undefined,
            { temperature: 0.7 },
            (event) => {
                if (streamingContent.length > 100) {
                    throw new Error('Simulated streaming interruption');
                }
                streamingContent += event.content;
            }
        ).catch(error => {
            streamingError = error;
        });

        await streamPromise;

        // Verify partial content was preserved
        assert.ok(streamingContent.length > 0);
        assert.ok(streamingError, 'Expected streaming error was not thrown');

        // System should still be usable after interruption
        const response = await llmProviderManager.getActiveProvider()?.generateCompletion(
            'model1',
            'Simple test prompt',
            undefined,
            { temperature: 0.7 }
        );

        assert.ok(response?.content);
    });

    test('recovers from context corruption', async () => {
        const conversationId = 'error-test-5';
        await conversationManager.startNewConversation('Error Test 5');

        // Create valid context
        await contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'let x = 1;',
            codeLanguage: 'typescript'
        });

        // Simulate context corruption
        const context = contextManager.getContext(conversationId);
        (context as any).selectedCode = undefined;
        (context as any).codeLanguage = null;

        // Attempt to use corrupted context
        const response = await llmProviderManager.getActiveProvider()?.generateCompletion(
            'model1',
            await contextManager.buildPrompt(conversationId, 'What is x?'),
            undefined,
            { temperature: 0.7 }
        );

        // Verify system recovered and provided a response
        assert.ok(response?.content);
        
        // Context should be repaired
        const repairedContext = contextManager.getContext(conversationId);
        assert.ok(repairedContext.selectedCode !== undefined);
        assert.ok(repairedContext.codeLanguage !== null);
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