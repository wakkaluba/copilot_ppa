import { LLMProvider } from '../../src/services/llm/llmProvider';
import { LLMProviderManager } from '../../src/services/llm/services/LLMProviderManager';
import { ConnectionStatusService } from '../../src/status/connectionStatusService';

describe('Component Performance Tests', () => {
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

    test('handles large conversations without memory leaks', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        const initialMemory = process.memoryUsage().heapUsed;
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            await llmProviderManager.generateCompletion('Test prompt ' + i);
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

        // Memory increase should be relatively small
        expect(memoryIncrease).toBeLessThan(50); // Less than 50MB increase
    });

    test('maintains performance under concurrent requests', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        const concurrentRequests = 10;
        const requests = Array(concurrentRequests).fill(0).map((_, i) => 
            llmProviderManager.generateCompletion('Concurrent request ' + i)
        );

        const startTime = Date.now();
        await Promise.all(requests);
        const duration = Date.now() - startTime;

        // Average time per request should be reasonable
        const avgTimePerRequest = duration / concurrentRequests;
        expect(avgTimePerRequest).toBeLessThan(100); // Less than 100ms per request on average
    });

    test('efficiently processes large code files', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        const largeCodeFile = 'a'.repeat(100000); // 100KB of text
        const startTime = Date.now();
        
        await llmProviderManager.generateCompletion(largeCodeFile);
        
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(1000); // Should process within 1 second
    });

    test('streaming response memory stability', async () => {
        await llmProviderManager.initializeProvider('test' as any, {
            provider: mockProvider,
            config: {}
        } as any);

        const initialMemory = process.memoryUsage().heapUsed;
        const iterations = 50;
        const events: { content: string; done: boolean }[] = [];

        for (let i = 0; i < iterations; i++) {
            await llmProviderManager.streamCompletion(
                'Streaming test ' + i,
                undefined,
                undefined,
                event => events.push(event)
            );
        }

        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

        expect(memoryIncrease).toBeLessThan(20); // Less than 20MB increase
        expect(events.length).toBe(iterations * 2); // Each iteration produces 2 events
    });

    test('context switching performance', async () => {
        const providers = await Promise.all([
            llmProviderManager.initializeProvider('test1' as any, {
                provider: {...mockProvider, id: 'test1'},
                config: {}
            } as any),
            llmProviderManager.initializeProvider('test2' as any, {
                provider: {...mockProvider, id: 'test2'},
                config: {}
            } as any)
        ]);

        const startTime = Date.now();
        const switches = 20;

        for (let i = 0; i < switches; i++) {
            await llmProviderManager.generateCompletion('Switch test', undefined, {
                providerId: providers[i % 2]
            });
        }

        const duration = Date.now() - startTime;
        const avgSwitchTime = duration / switches;

        expect(avgSwitchTime).toBeLessThan(50); // Less than 50ms per context switch
    });
});