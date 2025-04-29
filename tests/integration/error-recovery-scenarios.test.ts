import { LLMProvider } from '../../src/services/llm/llmProvider';
import { LLMProviderManager } from '../../src/services/llm/services/LLMProviderManager';
import { ConnectionStatusService } from '../../src/status/connectionStatusService';
import * as assert from 'assert';

describe('Error Recovery and Resilience', () => {
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

    test('recovers from connection failures', async () => {
        // First initialization succeeds
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        // Make next connection attempt fail
        mockProvider.connect = jest.fn()
            .mockRejectedValueOnce(new Error('Connection failed'))
            .mockResolvedValueOnce(undefined);

        // Should recover and retry connection
        const response = await llmProviderManager.generateCompletion('test');
        expect(response.content).toContain('test');
        expect(mockProvider.connect).toHaveBeenCalledTimes(2);
    });

    test('handles interrupted streaming', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        let streamingStarted = false;
        
        // Simulate connection dropping mid-stream
        mockProvider.streamCompletion = jest.fn().mockImplementation(async (model, prompt, systemPrompt, options, callback) => {
            if (callback) {
                callback({ content: 'Starting stream...', done: false });
                streamingStarted = true;
                throw new Error('Connection lost');
            }
        });

        const events: { content: string; done: boolean }[] = [];
        await expect(llmProviderManager.streamCompletion(
            'test',
            undefined,
            undefined,
            event => events.push(event)
        )).rejects.toThrow('Connection lost');

        expect(streamingStarted).toBe(true);
        expect(events.length).toBe(1);
        expect(events[0].content).toBe('Starting stream...');
    });

    test('handles partial loading of conversations', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        mockProvider.generateCompletion = jest.fn()
            .mockImplementationOnce(() => Promise.reject(new Error('Partial failure')))
            .mockImplementation((model, prompt) => Promise.resolve({
                content: 'Recovered: ' + prompt,
                model: model
            }));

        // First call fails
        await expect(llmProviderManager.generateCompletion('test'))
            .rejects.toThrow('Partial failure');

        // Second call should recover
        const response = await llmProviderManager.generateCompletion('test');
        expect(response.content).toContain('Recovered: test');
    });
});