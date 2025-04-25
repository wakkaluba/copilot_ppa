import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/ConversationManager';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { SnippetManager } from '../../src/services/snippetManager';
import { createMockExtensionContext } from '../helpers/mockHelpers';

describe('Complex Component Interactions', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let llmProviderManager: LLMProviderManager;
    let snippetManager: SnippetManager;
    let mockContext: vscode.ExtensionContext;

    beforeEach(async () => {
        // Create mock extension context
        mockContext = createMockExtensionContext();
        
        // Mock implementations
        jest.spyOn(ContextManager, 'getInstance').mockImplementation(() => {
            return {
                initialize: jest.fn().mockResolvedValue(undefined),
                getContext: jest.fn().mockImplementation((conversationId) => ({
                    conversationId,
                    activeFile: 'example.ts',
                    selectedCode: 'interface TestInterface { prop1: string; prop2: number; }',
                    codeLanguage: 'typescript'
                })),
                updateContext: jest.fn().mockResolvedValue(undefined),
                buildContextString: jest.fn().mockResolvedValue('context string'),
                dispose: jest.fn()
            } as unknown as ContextManager;
        });
        
        jest.spyOn(ConversationManager, 'getInstance').mockImplementation(() => {
            const messages = [
                { role: 'user', content: 'What is this interface for?' },
                { role: 'assistant', content: 'This interface contains string and number properties' }
            ];
            
            return {
                initialize: jest.fn().mockResolvedValue(undefined),
                startNewConversation: jest.fn().mockImplementation((title) => 
                    Promise.resolve({ id: `conversation-${Date.now()}`, title })
                ),
                loadConversation: jest.fn().mockResolvedValue({}),
                addMessage: jest.fn().mockResolvedValue(undefined),
                getCurrentContext: jest.fn().mockReturnValue(messages),
                getConversation: jest.fn().mockImplementation((id) => 
                    Promise.resolve({ id, messages })
                ),
                dispose: jest.fn()
            } as unknown as ConversationManager;
        });
        
        jest.spyOn(LLMProviderManager.prototype, 'registerProvider').mockImplementation(function(provider) {
            // Mock provider registration
            this.providers = this.providers || new Map();
            this.providers.set(provider.name, provider);
        });
        
        jest.spyOn(LLMProviderManager.prototype, 'generateCompletion').mockImplementation(function(providerName, model, prompt) {
            if (prompt.includes('programming concepts')) {
                return Promise.resolve({
                    content: 'Programming concepts include variables, functions, and classes',
                    model: model,
                    usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
                });
            }
            
            return Promise.resolve({
                content: 'This interface contains string and number properties',
                model: model,
                usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 }
            });
        });
        
        jest.spyOn(SnippetManager, 'getInstance').mockImplementation(() => {
            const snippets = new Map();
            
            return {
                initialize: jest.fn().mockResolvedValue(undefined),
                createSnippet: jest.fn().mockImplementation((title, messages, tags, conversationId) => {
                    const id = `snippet-${Date.now()}`;
                    const snippet = { id, title, messages, tags, conversationId, createdAt: Date.now() };
                    snippets.set(id, snippet);
                    return Promise.resolve(snippet);
                }),
                getSnippet: jest.fn().mockImplementation((id) => snippets.get(id)),
                getAllSnippets: jest.fn().mockImplementation(() => Array.from(snippets.values())),
                deleteSnippet: jest.fn().mockImplementation((id) => {
                    snippets.delete(id);
                    return Promise.resolve(true);
                }),
                dispose: jest.fn()
            } as unknown as SnippetManager;
        });

        // Initialize the components
        contextManager = ContextManager.getInstance(mockContext);
        conversationManager = ConversationManager.getInstance(mockContext);
        llmProviderManager = new LLMProviderManager();
        snippetManager = SnippetManager.getInstance(mockContext);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('integrates context, conversations and LLM responses', async () => {
        // Create a new conversation
        const { id: conversationId } = await conversationManager.startNewConversation('Test Conversation');
        
        // Set up some context data
        await contextManager.updateContext(conversationId, {
            activeFile: 'example.ts',
            selectedCode: 'interface TestInterface { prop1: string; prop2: number; }',
            codeLanguage: 'typescript'
        });
        
        // Mock the LLM provider
        const mockProvider = {
            name: 'TestProvider',
            isConnected: jest.fn().mockReturnValue(true),
            generateCompletion: jest.fn().mockResolvedValue({
                content: 'This interface contains string and number properties',
                model: 'test-model',
                usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 }
            })
        };
        
        llmProviderManager.registerProvider(mockProvider as any);
        
        // Send a prompt about the code
        const response = await llmProviderManager.generateCompletion(
            'TestProvider',
            'test-model',
            'What is this interface for?',
            'You are analyzing code',
            {}
        );
        
        // Add the user message and LLM response to the conversation
        await conversationManager.addMessage('user', 'What is this interface for?');
        await conversationManager.addMessage('assistant', response.content);
        
        // Send a follow-up question
        const response2 = await llmProviderManager.generateCompletion(
            'TestProvider',
            'test-model',
            'What are the properties of this interface?',
            'You are analyzing code',
            {}
        );
        
        await conversationManager.addMessage('user', 'What are the properties of this interface?');
        await conversationManager.addMessage('assistant', response2.content);
        
        // Verify the context has been maintained through the conversation
        const context = await contextManager.getContext(conversationId);
        assert.strictEqual(context.activeFile, 'example.ts');
    });

    test('passes context between components correctly', async () => {
        // Create conversation with context
        const { id: conversationId } = await conversationManager.startNewConversation('Context Test');
        
        // Set up initial context
        await contextManager.updateContext(conversationId, {
            activeFile: 'example1.ts',
            selectedCode: 'function test() {}',
            codeLanguage: 'typescript'
        });
        
        // Create a new message using the context
        await llmProviderManager.registerProvider({
            name: 'TestProvider',
            isConnected: jest.fn().mockReturnValue(true),
            generateCompletion: jest.fn().mockImplementation((model, prompt, systemPrompt) => {
                if (prompt.includes('programming concepts')) {
                    return Promise.resolve({
                        content: 'Programming concepts include variables, functions, and classes',
                        model: 'test-model',
                        usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
                    });
                }
                return Promise.resolve({
                    content: 'Standard response',
                    model: 'test-model',
                    usage: { promptTokens: 5, completionTokens: 2, totalTokens: 7 }
                });
            })
        } as any);
        
        // Generate a completion that should use the context
        await llmProviderManager.generateCompletion(
            'TestProvider',
            'test-model',
            'Explain programming concepts',
            'You are a coding assistant',
            {}
        );
        
        // Update the context with new information
        await contextManager.updateContext(conversationId, {
            activeFile: 'example2.ts',
            selectedCode: 'function test2() {}',
            codeLanguage: 'typescript'
        });
        
        // Verify the context was updated correctly
        const context = await contextManager.getContext(conversationId);
        assert.strictEqual(context.activeFile, 'example2.ts');
        assert.strictEqual(context.selectedCode, 'function test2() {}');
        
        // Add messages to the conversation
        await conversationManager.addMessage('user', 'How do I use this function?');
        
        // Verify the conversation history
        const conversation = await conversationManager.getConversation(conversationId);
        assert.ok(conversation.messages);
    });

    test('snippets integration with conversations', async () => {
        // Create a conversation with some messages
        const { id: conversationId } = await conversationManager.startNewConversation('Snippet Test');
        
        // Add messages to the conversation
        await conversationManager.addMessage('user', 'What does this interface do?');
        
        // Mock LLM response
        const mockResponse = 'This interface defines a data structure for storing key-value pairs';
        await conversationManager.addMessage('assistant', mockResponse);
        
        // Create a snippet from the conversation
        const snippet = await snippetManager.createSnippet(
            'Key-Value Interface',
            [
                { role: 'user', content: 'What does this interface do?' },
                { role: 'assistant', content: mockResponse }
            ],
            ['interface', 'typescript'],
            conversationId
        );
        
        // Verify the snippet was created correctly
        assert.strictEqual(snippet.title, 'Key-Value Interface');
        assert.strictEqual(snippet.messages.length, 2);
        
        // Verify the snippet can be retrieved
        const retrievedSnippet = snippetManager.getSnippet(snippet.id);
        assert.strictEqual(retrievedSnippet!.title, 'Key-Value Interface');
    });
});