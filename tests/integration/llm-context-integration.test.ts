import { LLMProvider } from '../../src/services/llm/llmProvider';
import { LLMProviderManager } from '../../src/services/llm/services/LLMProviderManager';
import { ConnectionStatusService } from '../../src/status/connectionStatusService';
import * as assert from 'assert';

describe('LLM Context Integration', () => {
    let llmProviderManager: LLMProviderManager;
    let connectionService: ConnectionStatusService;
    let mockProvider: LLMProvider;

    beforeEach(() => {
        connectionService = new ConnectionStatusService();
        llmProviderManager = new LLMProviderManager(connectionService);

        mockProvider = {
            id: 'test-provider',
            name: 'test',
            isConnected: () => true,
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            isAvailable: jest.fn().mockResolvedValue(true),
            listModels: jest.fn().mockResolvedValue([{
                name: 'test-model',
                modified_at: new Date().toISOString(),
                size: 1000
            }]),
            generateCompletion: jest.fn().mockImplementation((model, prompt) => 
                Promise.resolve({
                    content: 'Test response for: ' + prompt,
                    model: model
                })
            ),
            streamCompletion: jest.fn().mockImplementation((model, prompt, systemPrompt, options, callback) => {
                if (callback) {
                    callback({ content: 'Streaming: ', done: false });
                    callback({ content: prompt, done: true });
                }
                return Promise.resolve();
            })
        };
    });

    afterEach(async () => {
        await llmProviderManager.dispose();
    });

    test('handles basic completion request', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        const response = await llmProviderManager.generateCompletion('Hello world');
        
        expect(response.content).toContain('Hello world');
        expect(mockProvider.generateCompletion).toHaveBeenCalled();
    });

    test('handles streaming completion', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        const events: { content: string; done: boolean }[] = [];
        
        await llmProviderManager.streamCompletion(
            'Test prompt',
            undefined,
            undefined,
            (event) => events.push(event)
        );

        expect(events.length).toBeGreaterThan(0);
        expect(events.some(e => e.done)).toBe(true);
        expect(mockProvider.streamCompletion).toHaveBeenCalled();
    });

    test('handles provider errors gracefully', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        mockProvider.generateCompletion = jest.fn().mockRejectedValue(new Error('Test error'));

        await expect(llmProviderManager.generateCompletion('test'))
            .rejects.toThrow('Test error');
    });
});