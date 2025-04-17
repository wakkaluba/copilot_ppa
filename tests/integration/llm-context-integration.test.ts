import * as assert from 'assert';
import { LMStudioProvider } from '../../src/llm/lmstudio-provider';
import { OllamaProvider } from '../../src/llm/ollama-provider';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';

describe('LLM Provider and Context Manager Integration', () => {
    let contextManager: ContextManager;
    let ollamaProvider: OllamaProvider;
    let lmStudioProvider: LMStudioProvider;
    let history: ConversationHistory;

    beforeEach(() => {
        history = new ConversationHistory();
        contextManager = ContextManager.getInstance(history);
        ollamaProvider = new OllamaProvider('http://localhost:11434');
        lmStudioProvider = new LMStudioProvider('http://localhost:1234');
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

        // Add some conversation history
        const prompt1 = 'What is TypeScript?';
        const response1 = await ollamaProvider.generateCompletion('codellama', prompt1);
        await history.addMessage(conversationId, 'user', prompt1);
        await history.addMessage(conversationId, 'assistant', response1.content);

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

        // Start streaming that will fail
        const streamingPromise = ollamaProvider.streamCompletion(
            'codellama',
            await contextManager.buildPrompt(conversationId, 'Explain this interface'),
            undefined,
            { temperature: 0.7 },
            () => {}
        );

        // Force streaming to fail
        await assert.rejects(
            streamingPromise,
            (error: any) => {
                return error instanceof Error;
            }
        );

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

        // Verify streaming completed and new context is intact
        const verificationResponse = await lmStudioProvider.generateCompletion(
            'CodeLlama-7b',
            await contextManager.buildPrompt(conversationId, 'What is x?')
        );

        assert.ok(streamedContent.length > 0);
        assert.ok(verificationResponse.content.toLowerCase().includes('42'));
    });
});