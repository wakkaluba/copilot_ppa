import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/ConversationManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ModelManager } from '../../src/models/modelManager';
import { PerformanceManager } from '../../src/performance/performanceManager';

describe('State Persistence and Data Migration', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let llmProviderManager: LLMProviderManager;
    let modelManager: ModelManager;
    let performanceManager: PerformanceManager;
    let history: ConversationHistory;
    let storageDir: string;

    beforeEach(async () => {
        // Create temporary storage directory
        storageDir = path.join(__dirname, '.temp-storage');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: storageDir,
            storagePath: path.join(storageDir, 'storage')
        } as any as vscode.ExtensionContext;

        history = new ConversationHistory(context);
        await history.initialize();
        
        contextManager = ContextManager.getInstance(history);
        conversationManager = ConversationManager.getInstance();
        llmProviderManager = LLMProviderManager.getInstance();
        modelManager = new ModelManager();
        performanceManager = PerformanceManager.getInstance();
    });

    afterEach(() => {
        // Clean up temporary storage
        if (fs.existsSync(storageDir)) {
            fs.rmSync(storageDir, { recursive: true, force: true });
        }
    });

    test('preserves context across extension reloads', async () => {
        const conversationId = 'state-test-1';
        await conversationManager.startNewConversation('State Test 1');

        // Create complex nested context with user preferences
        await contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'interface Test { prop: string; }',
            codeLanguage: 'typescript'
        });

        // Add conversation messages
        await conversationManager.addMessage('user', 'What is TypeScript?');
        await conversationManager.addMessage('assistant', 'TypeScript is a typed superset of JavaScript.');

        // Set language preferences through context analysis
        await contextManager.buildContextString();

        // Simulate extension reload by recreating components
        const newHistory = new ConversationHistory(history.context);
        await newHistory.initialize();

        const newContextManager = ContextManager.getInstance(newHistory);
        const newConversationManager = ConversationManager.getInstance();

        // Load conversation and verify state
        await newConversationManager.loadConversation(conversationId);
        const context = newContextManager.getContext(conversationId);
        const messages = newConversationManager.getCurrentContext();

        // Verify context preservation
        assert.strictEqual(context.activeFile, 'test.ts');
        assert.strictEqual(context.selectedCode, 'interface Test { prop: string; }');
        assert.strictEqual(context.codeLanguage, 'typescript');

        // Verify message preservation
        assert.strictEqual(messages.length, 2);
        assert.strictEqual(messages[0].content, 'What is TypeScript?');
        assert.strictEqual(messages[1].content, 'TypeScript is a typed superset of JavaScript.');
    });

    test('handles data migration between formats', async () => {
        // Create data in old format
        const oldFormatData = {
            conversations: [
                {
                    id: 'old-format-1',
                    messages: [
                        { role: 'user', content: 'Old message', timestamp: Date.now() - 1000 }
                    ],
                    metadata: {
                        context: {
                            language: 'javascript',
                            framework: 'react'
                        }
                    }
                }
            ]
        };

        // Write old format data
        const oldDataPath = path.join(storageDir, 'storage', 'old-conversations.json');
        fs.writeFileSync(oldDataPath, JSON.stringify(oldFormatData));

        // Initialize new components
        const newHistory = new ConversationHistory(history.context);
        await newHistory.initialize();

        const newContextManager = ContextManager.getInstance(newHistory);
        const newConversationManager = ConversationManager.getInstance();

        // Load and migrate data
        await newConversationManager.loadConversation('old-format-1');
        const context = newContextManager.getContext('old-format-1');
        const messages = newConversationManager.getCurrentContext();

        // Verify data migration
        assert.ok(messages.length > 0);
        assert.strictEqual(messages[0].content, 'Old message');
        assert.ok(context.conversationId);
    });

    test('maintains performance data across sessions', async () => {
        // Record initial performance metrics
        performanceManager.setEnabled(true);
        
        // Generate some performance data
        for (let i = 0; i < 10; i++) {
            await Promise.all([
                contextManager.buildContextString(),
                llmProviderManager.getActiveProvider()?.generateCompletion(
                    'model1',
                    'Test prompt',
                    undefined,
                    { temperature: 0.7 }
                )
            ]);
        }

        // Get initial metrics
        const initialMetrics = await performanceManager.getMetrics();

        // Simulate session restart
        const newPerformanceManager = PerformanceManager.getInstance();
        newPerformanceManager.setEnabled(true);

        // Get metrics after restart
        const restoredMetrics = await newPerformanceManager.getMetrics();

        // Verify metrics preservation
        assert.ok(restoredMetrics.responseTime > 0);
        assert.ok(restoredMetrics.operationsCount > 0);
        assert.strictEqual(restoredMetrics.operationsCount, initialMetrics.operationsCount);
    });

    test('recovers from corrupted state files', async () => {
        const conversationId = 'state-test-corrupted';
        await conversationManager.startNewConversation('Corrupted State Test');

        // Add some initial data
        await conversationManager.addMessage('user', 'Initial message');
        await contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'let x = 1;',
            codeLanguage: 'typescript'
        });

        // Get file paths
        const stateFile = path.join(storageDir, 'storage', `${conversationId}.json`);
        const contextFile = path.join(storageDir, 'storage', `${conversationId}-context.json`);

        // Corrupt the files
        fs.writeFileSync(stateFile, 'corrupted{json');
        fs.writeFileSync(contextFile, '{partial:true');

        // Attempt to load with new instances
        const newHistory = new ConversationHistory(history.context);
        await newHistory.initialize();

        const newContextManager = ContextManager.getInstance(newHistory);
        const newConversationManager = ConversationManager.getInstance();

        // Load conversation - should create new state rather than fail
        await newConversationManager.loadConversation(conversationId);
        const context = newContextManager.getContext(conversationId);

        // Verify recovery
        assert.ok(context.conversationId);
        assert.ok(context.systemPrompt);
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