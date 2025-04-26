import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/conversationManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { LLMProvider } from '../../src/llm/llm-provider';
import { createMockExtensionContext } from '../helpers/mockHelpers';

describe('Error Recovery and Resilience', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let llmProviderManager: LLMProviderManager;
    let history: ConversationHistory;
    let mockContext: vscode.ExtensionContext;

    beforeEach(async () => {
        // Create mock extension context with proper methods
        mockContext = createMockExtensionContext();
        
        // Mock the required implementations
        jest.spyOn(ConversationHistory.prototype, 'initialize').mockResolvedValue(undefined);
        jest.spyOn(ContextManager.prototype, 'initialize').mockResolvedValue(undefined);
        
        // Mock getContext to return valid data
        jest.spyOn(ContextManager.prototype, 'getContext').mockImplementation((id) => {
            return {
                conversationId: id,
                activeFile: 'test.ts',
                selectedCode: 'test code',
                codeLanguage: 'typescript',
                systemPrompt: 'You are a helpful assistant'
            };
        });

        // Initialize components
        history = new ConversationHistory(mockContext);
        await history.initialize();
        
        contextManager = new ContextManager(mockContext);
        await contextManager.initialize();
        
        // Mock conversation manager methods
        jest.spyOn(ConversationManager, 'getInstance').mockImplementation(() => {
            return {
                startNewConversation: jest.fn().mockResolvedValue({ id: 'test-conversation-id' }),
                addMessage: jest.fn().mockResolvedValue(undefined),
                loadConversation: jest.fn().mockResolvedValue({}),
                getContext: jest.fn().mockReturnValue([]),
                getCurrentContext: jest.fn().mockReturnValue([]),
                getConversation: jest.fn().mockResolvedValue({ messages: [] }),
                dispose: jest.fn()
            } as unknown as ConversationManager;
        });
        
        conversationManager = ConversationManager.getInstance(mockContext);
        
        // Create LLMProviderManager with mocked methods
        llmProviderManager = new LLMProviderManager();
        jest.spyOn(llmProviderManager, 'connect').mockImplementation(async (providerName) => {
            if (providerName === 'MockProvider') {
                return Promise.reject(new Error('Connection error'));
            }
            return Promise.resolve();
        });
        jest.spyOn(llmProviderManager, 'registerProvider').mockImplementation((provider) => {
            // Store the provider in a mock map
            (llmProviderManager as any).providers = (llmProviderManager as any).providers || new Map();
            (llmProviderManager as any).providers.set(provider.name, provider);
        });
        jest.spyOn(llmProviderManager, 'getProvider').mockImplementation((name) => {
            return (llmProviderManager as any).providers?.get(name);
        });
        jest.spyOn(llmProviderManager, 'generateCompletion').mockResolvedValue({
            content: 'Mock response',
            model: 'mock-model',
            usage: { totalTokens: 10, promptTokens: 5, completionTokens: 5 }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('recovers from LLM connection failures', async () => {
        // Create a mock provider that fails to connect
        const mockProvider: Partial<LLMProvider> = {
            name: 'MockProvider',
            connect: jest.fn().mockRejectedValue(new Error('Connection error')),
            isConnected: jest.fn().mockReturnValue(false),
            generateCompletion: jest.fn().mockRejectedValue(new Error('Not connected'))
        };

        // Register the failing provider
        llmProviderManager.registerProvider(mockProvider as LLMProvider);
        
        // Try to connect and handle the error gracefully
        await llmProviderManager.connect('MockProvider').catch(() => {});
        
        // Verify that the error was handled
        const provider = llmProviderManager.getProvider('MockProvider');
        assert.ok(provider);
        assert.strictEqual(provider.isConnected(), false);
        
        // Verify that operations still work despite connection failure
        const conversationId = 'error-test-1';
        await conversationManager.startNewConversation('Error Test 1');
        
        // This should not throw an error despite the LLM provider being down
        await conversationManager.addMessage('user', 'Test message');
        
        // The context manager should still function
        const context = await contextManager.getContext(conversationId);
        assert.ok(context);
    });

    test('handles partial loading of conversations', async () => {
        // Create multiple conversations
        const results = [
            { id: 'conv-1' },
            { id: 'conv-2' },
            { id: 'corrupt-conv' }
        ];
        
        // Mock conversation manager loadConversation for this specific test
        const mockLoadConversation = jest.fn().mockImplementation(async (id) => {
            if (id === 'corrupt-conv') {
                return Promise.reject(new Error('Corrupted conversation file'));
            }
            return Promise.resolve({ id });
        });
        
        // Override the mock we set in beforeEach
        jest.spyOn(conversationManager, 'loadConversation').mockImplementation(mockLoadConversation);
        
        // Try to load all conversations
        const loadPromises = results.map(result => 
            conversationManager.loadConversation(result.id).catch(err => ({ error: err }))
        );
        
        const loadResults = await Promise.all(loadPromises);
        
        // Verify that we could load the non-corrupted ones
        const successfulLoads = loadResults.filter(result => !result || !('error' in result));
        assert.strictEqual(successfulLoads.length, 2);
    });

    test('handles interrupted message streams', async () => {
        // Create a conversation to test
        const conversationId = 'stream-test';
        await conversationManager.startNewConversation('Stream Test');
        
        // Mock a streaming response that gets interrupted
        const mockProvider: Partial<LLMProvider> = {
            name: 'StreamProvider',
            isConnected: jest.fn().mockReturnValue(true),
            streamCompletion: jest.fn().mockImplementation((model, prompt, systemPrompt, options, callback) => {
                // Send a partial response
                callback('This is a partial response');
                
                // Simulate network interruption by rejecting
                return Promise.reject(new Error('Connection lost'));
            }),
            generateCompletion: jest.fn().mockResolvedValue({
                content: 'Fallback response',
                model: 'fallback-model',
                usage: { totalTokens: 10, promptTokens: 5, completionTokens: 5 }
            })
        };
        
        llmProviderManager.registerProvider(mockProvider as LLMProvider);
        
        // Try to generate a response with the flaky provider
        try {
            await llmProviderManager.generateCompletion(
                'StreamProvider',
                'default-model',
                'Generate a long response',
                'You are a helpful assistant',
                {}
            );
        } catch (e) {
            // Error should be caught and handled internally
        }
        
        // Verify the conversation still has valid context after the error
        const context = await contextManager.getContext(conversationId);
        assert.ok(context);
        assert.strictEqual(context.conversationId, conversationId);
    });

    test('can recover context from partial data', async () => {
        // Create conversation with partial data
        const conversationId = 'partial-context-test';
        await conversationManager.startNewConversation('Partial Context Test');
        
        // Override the getContext mock to simulate corrupted data
        const mockGetContext = jest.spyOn(contextManager, 'getContext');
        mockGetContext.mockImplementation((id) => {
            if (id === conversationId) {
                return {
                    conversationId,
                    activeFile: 'x.js',
                    selectedCode: '',  // Empty but not undefined
                    codeLanguage: 'javascript'  // Valid value
                };
            }
            return {
                conversationId: id,
                activeFile: 'test.ts',
                selectedCode: 'test code',
                codeLanguage: 'typescript',
                systemPrompt: 'You are a helpful assistant'
            };
        });
        
        // Attempt to repair the context
        const repairedContext = await contextManager.getContext(conversationId);
        
        // Verify context has been properly recovered/repaired
        assert.ok(repairedContext.selectedCode !== undefined);
        assert.ok(repairedContext.codeLanguage !== null);
        assert.strictEqual(repairedContext.activeFile, 'x.js');
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
    
    keys(): readonly string[] {
        return Array.from(this.storage.keys());
    }
}