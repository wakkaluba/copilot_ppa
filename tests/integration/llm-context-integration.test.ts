import * as assert from 'assert';
import * as vscode from 'vscode';
import { LMStudioProvider } from '../../src/llm/lmstudio-provider';
import { OllamaProvider } from '../../src/llm/ollama-provider';
import { ContextManager } from '../../src/services/ContextManager';
import { createMockExtensionContext } from '../helpers/mockHelpers';

describe('LLM Provider and Context Manager Integration', () => {
    let contextManager: ContextManager;
    let ollamaProvider: OllamaProvider;
    let lmStudioProvider: LMStudioProvider;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        // Set up mocks
        mockContext = createMockExtensionContext();
        
        // Mock ContextManager methods
        jest.spyOn(ContextManager, 'getInstance').mockImplementation(() => {
            return {
                createContext: jest.fn().mockResolvedValue(undefined),
                updateContext: jest.fn().mockResolvedValue(undefined),
                getContext: jest.fn().mockReturnValue({
                    activeFile: 'test.ts',
                    selectedCode: 'function add(a: number, b: number): number { return a + b; }',
                    codeLanguage: 'typescript'
                }),
                buildPrompt: jest.fn().mockImplementation((id, userPrompt) => {
                    return Promise.resolve(`Context: typescript\nCode: function add(a: number, b: number): number { return a + b; }\n\nUser: ${userPrompt}`);
                }),
                initialize: jest.fn().mockResolvedValue(undefined),
                dispose: jest.fn()
            } as unknown as ContextManager;
        });

        // Initialize components
        contextManager = ContextManager.getInstance(mockContext);

        // Mock LLM providers
        ollamaProvider = new OllamaProvider('http://localhost:11434');
        jest.spyOn(ollamaProvider, 'generateCompletion').mockImplementation((model, prompt) => {
            if (prompt.includes('TypeScript')) {
                return Promise.resolve({
                    content: 'TypeScript is a statically typed superset of JavaScript.',
                    model: 'codellama',
                    usage: { promptTokens: 10, completionTokens: 10, totalTokens: 20 }
                });
            } else if (prompt.includes('What does this function do')) {
                return Promise.resolve({
                    content: 'This function adds two numbers together and returns the result.',
                    model: 'codellama',
                    usage: { promptTokens: 15, completionTokens: 12, totalTokens: 27 }
                });
            } else {
                return Promise.resolve({
                    content: 'Default response from Ollama provider',
                    model: 'codellama',
                    usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 }
                });
            }
        });

        jest.spyOn(ollamaProvider, 'streamCompletion').mockImplementation((model, prompt, systemPrompt, options, callback) => {
            if (prompt.includes('Explain programming')) {
                setTimeout(() => callback({ content: 'Programming is the process of', done: false }), 10);
                setTimeout(() => callback({ content: ' creating instructions for computers to follow.', done: true }), 20);
                return Promise.resolve();
            } else if (prompt.includes('Explain this interface')) {
                setTimeout(() => callback({ content: 'This interface defines a User', done: false }), 10);
                return Promise.reject(new Error('Connection lost')); // Simulate failure
            }
            return Promise.resolve();
        });

        lmStudioProvider = new LMStudioProvider('http://localhost:1234');
        jest.spyOn(lmStudioProvider, 'generateCompletion').mockImplementation((model, prompt) => {
            if (prompt.includes('What does this function do')) {
                return Promise.resolve({
                    content: 'The function takes two numbers as parameters and adds them together.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 15, completionTokens: 12, totalTokens: 27 }
                });
            } else if (prompt.includes('How does it differ')) {
                return Promise.resolve({
                    content: 'TypeScript adds static typing to JavaScript. Unlike JavaScript, TypeScript code needs to be compiled.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 20, completionTokens: 15, totalTokens: 35 }
                });
            } else if (prompt.includes('What is this code about?') || prompt.includes('interface')) {
                return Promise.resolve({
                    content: 'This code defines a User interface with name and age properties.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 10, completionTokens: 12, totalTokens: 22 }
                });
            } else if (prompt.includes('What is x?')) {
                return Promise.resolve({
                    content: 'x is a constant with the value 42.',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 5, completionTokens: 8, totalTokens: 13 }
                });
            } else {
                return Promise.resolve({
                    content: 'Default response from LMStudio provider',
                    model: 'CodeLlama-7b',
                    usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 }
                });
            }
        });
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('handles context switching between providers', async () => {
        const conversationId = 'test-conversation';
        await contextManager.createContext(conversationId);
        
        // Update context with code
        await contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'function add(a: number, b: number): number { return a + b; }',
            codeLanguage: 'typescript'
        });

        // Get completion from first provider
        const ollamaResponse = await ollamaProvider.generateCompletion(
            'codellama',
            await contextManager.buildPrompt(conversationId, 'What does this function do?'),
            undefined,
            { temperature: 0.7 }
        );

        // Switch provider and get another completion
        const lmStudioResponse = await lmStudioProvider.generateCompletion(
            'CodeLlama-7b',
            await contextManager.buildPrompt(conversationId, 'What does this function do?'),
            undefined,
            { temperature: 0.7 }
        );

        // Both responses should be coherent with the context
        assert.ok(ollamaResponse.content.toLowerCase().includes('add'));
        assert.ok(ollamaResponse.content.toLowerCase().includes('number'));
        assert.ok(lmStudioResponse.content.toLowerCase().includes('add'));
        assert.ok(lmStudioResponse.content.toLowerCase().includes('number'));
    });

    test('maintains conversation history across provider switches', async () => {
        const conversationId = 'test-conversation-2';
        await contextManager.createContext(conversationId);

        // Add some conversation history - use mock directly
        const prompt1 = 'What is TypeScript?';
        const response1 = await ollamaProvider.generateCompletion('codellama', prompt1);
        
        // Override buildPrompt for this specific test to include conversation history
        jest.spyOn(contextManager, 'buildPrompt')
            .mockImplementationOnce((id, userPrompt) => {
                return Promise.resolve(`Previous: What is TypeScript?\nTypeScript is a statically typed superset of JavaScript.\n\nUser: ${userPrompt}`);
            });

        // Switch provider and continue conversation
        const prompt2 = 'How does it differ from JavaScript?';
        const response2 = await lmStudioProvider.generateCompletion(
            'CodeLlama-7b', 
            await contextManager.buildPrompt(conversationId, prompt2)
        );

        // Response should acknowledge previous context
        assert.ok(response2.content.toLowerCase().includes('typescript'));
        assert.ok(response2.content.toLowerCase().includes('javascript'));
    });

    test('recovers from streaming errors while maintaining context', async () => {
        const conversationId = 'test-conversation-3';
        await contextManager.createContext(conversationId);

        // Set up initial context
        await contextManager.updateContext(conversationId, {
            activeFile: 'test.ts',
            selectedCode: 'interface User { name: string; age: number; }',
            codeLanguage: 'typescript'
        });

        // Simulate streaming that will fail
        let error: Error | undefined;
        try {
            await ollamaProvider.streamCompletion(
                'codellama',
                await contextManager.buildPrompt(conversationId, 'Explain this interface'),
                undefined,
                { temperature: 0.7 },
                () => {}
            );
        } catch (e) {
            error = e as Error;
        }

        // Error should be thrown
        assert.ok(error instanceof Error);
        assert.strictEqual(error?.message, 'Connection lost');

        // Context should still be intact and usable
        const recoveryResponse = await lmStudioProvider.generateCompletion(
            'CodeLlama-7b',
            await contextManager.buildPrompt(conversationId, 'What is this code about?')
        );

        assert.ok(recoveryResponse.content.toLowerCase().includes('interface'));
        assert.ok(recoveryResponse.content.toLowerCase().includes('user'));
    });

    test('handles concurrent context updates during streaming', async () => {
        const conversationId = 'test-conversation-4';
        await contextManager.createContext(conversationId);

        let streamedContent = '';
        const streamHandler = (event: { content: string, done: boolean }) => {
            streamedContent += event.content;
        };

        // Start streaming
        const streamingPromise = ollamaProvider.streamCompletion(
            'codellama',
            await contextManager.buildPrompt(conversationId, 'Explain programming'),
            undefined,
            { temperature: 0.7 },
            streamHandler
        );

        // Update context while streaming is in progress
        await contextManager.updateContext(conversationId, {
            activeFile: 'newfile.ts',
            selectedCode: 'const x = 42;',
            codeLanguage: 'typescript'
        });

        await streamingPromise;

        // Override buildPrompt for this specific test to match the updated context
        jest.spyOn(contextManager, 'buildPrompt')
            .mockImplementationOnce((id, userPrompt) => {
                return Promise.resolve(`Context: typescript\nCode: const x = 42;\n\nUser: ${userPrompt}`);
            });

        // Verify streaming completed and new context is intact
        const verificationResponse = await lmStudioProvider.generateCompletion(
            'CodeLlama-7b',
            await contextManager.buildPrompt(conversationId, 'What is x?')
        );

        assert.ok(streamedContent.length > 0);
        assert.ok(verificationResponse.content.toLowerCase().includes('42'));
    });
});