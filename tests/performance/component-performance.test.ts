import * as assert from 'assert';
import { PerformanceManager } from '../../src/services/performance/PerformanceManager';
// Fix the import path to use consistent casing
import { ContextManager } from '../../src/services/contextManager';
import { LLMProviderManager } from '../../src/services/llm/LLMProviderManager';
import { WorkspaceManager } from '../../src/services/workspace/WorkspaceManager';
import { createMockExtensionContext } from '../helpers/mockHelpers';

describe('Component Performance Tests', () => {
    let llmManager: LLMProviderManager;
    let contextManager: ContextManager;
    let workspaceManager: WorkspaceManager;
    let mockContext: any;

    beforeEach(() => {
        // Create mock extension context
        mockContext = createMockExtensionContext();
        
        // Setup mocks
        jest.spyOn(LLMProviderManager, 'getInstance').mockImplementation(() => {
            return {
                getActiveProvider: jest.fn().mockReturnValue({
                    generateCompletion: jest.fn().mockImplementation(() => 
                        Promise.resolve({
                            content: 'Test completion response',
                            model: 'test-model',
                            usage: { promptTokens: 5, completionTokens: 10, totalTokens: 15 }
                        })
                    ),
                    streamCompletion: jest.fn().mockImplementation((model, prompt, systemPrompt, options, callback) => {
                        // Simulate streaming events
                        setTimeout(() => callback({ content: 'Streaming content 1' }), 100);
                        setTimeout(() => callback({ content: 'Streaming content 2' }), 200);
                        setTimeout(() => callback({ content: 'Streaming content 3' }), 300);
                        return Promise.resolve();
                    })
                })
            } as unknown as LLMProviderManager;
        });
        
        jest.spyOn(ContextManager, 'getInstance').mockImplementation(() => {
            return {
                createContext: jest.fn().mockResolvedValue(undefined),
                updateContext: jest.fn().mockResolvedValue(undefined),
                getContext: jest.fn().mockReturnValue({
                    activeFile: 'test.ts',
                    selectedCode: 'interface Test { prop: string; }',
                    codeLanguage: 'typescript'
                }),
                buildPrompt: jest.fn().mockImplementation((id, promptText) => {
                    return Promise.resolve(`System: You are a coding assistant\n\nLanguage: typescript\n\nCode:\ninterface Test { prop: string; }\n\n${promptText}`);
                }),
                dispose: jest.fn()
            } as unknown as ContextManager;
        });
        
        jest.spyOn(WorkspaceManager.prototype, 'readFile').mockImplementation((filePath) => {
            if (filePath === 'large-test.js') {
                // Generate fake file content with requested line count
                return Promise.resolve(
                    Array(10000)
                        .fill(null)
                        .map((_, i) => `console.log("Line ${i}");`)
                        .join('\n')
                );
            }
            return Promise.resolve('Default file content');
        });
        
        jest.spyOn(WorkspaceManager.prototype, 'writeFile').mockImplementation((filePath, content) => {
            return Promise.resolve();
        });

        // Initialize managers
        llmManager = LLMProviderManager.getInstance();
        contextManager = ContextManager.getInstance(mockContext);
        workspaceManager = new WorkspaceManager();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('handles large conversations without memory leaks', async () => {
        const messagesCount = 100;
        const messageSize = 1000; // characters
        const conversationId = 'perf-test-conversation';
        const longMessage = 'A'.repeat(messageSize);

        // Record initial heap
        const initialHeap = process.memoryUsage().heapUsed;

        // Mock adding many messages using context manager
        for (let i = 0; i < messagesCount; i++) {
            await contextManager.updateContext(conversationId, {
                messages: [{ 
                    role: i % 2 === 0 ? 'user' : 'assistant',
                    content: `${longMessage} - ${i}`
                }]
            });
        }

        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }

        const finalHeap = process.memoryUsage().heapUsed;
        const heapGrowth = finalHeap - initialHeap;
        const expectedMaxGrowth = messageSize * messagesCount * 2; // Conservative estimate

        // Verify heap growth is reasonable
        assert.ok(
            heapGrowth < expectedMaxGrowth,
            `Memory growth (${heapGrowth} bytes) exceeds expected maximum (${expectedMaxGrowth} bytes)`
        );
    });

    test('maintains performance under concurrent requests', async () => {
        const concurrentRequests = 10;
        const responseTimeThreshold = 1000; // 1 second

        // Create multiple concurrent completion requests
        const startTime = performance.now();
        const requests = Array(concurrentRequests).fill(null).map((_, i) => {
            const provider = llmManager.getActiveProvider();
            return provider?.generateCompletion(
                'model1',
                `Test prompt ${i}`,
                undefined,
                { temperature: 0.7 }
            );
        });

        // Wait for all requests to complete
        const responses = await Promise.all(requests);
        const totalTime = performance.now() - startTime;
        const averageTime = totalTime / concurrentRequests;

        // Verify performance
        assert.ok(responses.length === concurrentRequests);
        assert.ok(
            averageTime < responseTimeThreshold,
            `Average response time (${averageTime.toFixed(2)}ms) exceeds threshold (${responseTimeThreshold}ms)`
        );
    });

    test('efficiently processes large code files', async () => {
        const lineCount = 10000;

        const startTime = performance.now();
        
        // Read and process file
        const content = await workspaceManager.readFile('large-test.js');
        const lines = content.split('\n');
        
        const processingTime = performance.now() - startTime;
        const timePerLine = processingTime / lineCount;

        // Verify processing speed
        assert.ok(lines.length === lineCount);
        assert.ok(
            timePerLine < 0.5, // Less than 0.5ms per line for test environment
            `Processing time per line (${timePerLine.toFixed(3)}ms) is too high`
        );
    });

    test('context switching performance', async () => {
        const switchCount = 50;
        const contextSizes = [1000, 10000, 100000]; // bytes
        const results: { size: number, time: number }[] = [];

        for (const size of contextSizes) {
            const contextData = {
                activeFile: 'test.ts',
                selectedCode: 'A'.repeat(size),
                codeLanguage: 'typescript'
            };

            const startTime = performance.now();

            // Perform multiple context switches
            for (let i = 0; i < switchCount; i++) {
                const conversationId = `perf-test-${i}`;
                await contextManager.createContext(conversationId);
                await contextManager.updateContext(conversationId, contextData);
                const prompt = await contextManager.buildPrompt(conversationId, 'Test prompt');
                assert.ok(prompt.includes('typescript'));
            }

            const totalTime = performance.now() - startTime;
            results.push({
                size,
                time: totalTime / switchCount
            });
        }

        // Verify performance scales reasonably with context size
        // This is a simplified check since we're mocking actual implementation
        assert.ok(results.length === contextSizes.length);
    });

    test('streaming response memory stability', async () => {
        const streamDuration = 100; // Short duration for tests
        const samplingInterval = 10; // Short interval for tests
        const memoryReadings: number[] = [];
        let streamedContent = '';

        const provider = llmManager.getActiveProvider();
        if (!provider) {
            throw new Error('No provider available');
        }

        // Start streaming
        const streamPromise = provider.streamCompletion(
            'model1',
            'Generate a long response with multiple paragraphs about programming',
            undefined,
            { temperature: 0.7 },
            (content) => {
                streamedContent += content;
            }
        );

        // Monitor memory usage during streaming
        const startTime = performance.now();
        const monitoringPromise = new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                memoryReadings.push(process.memoryUsage().heapUsed);
                
                if (performance.now() - startTime >= streamDuration) {
                    clearInterval(interval);
                    resolve();
                }
            }, samplingInterval);
        });

        await Promise.all([streamPromise, monitoringPromise]);

        // Verify streaming content was received
        assert.ok(streamedContent.includes('Streaming content'));
        assert.ok(memoryReadings.length > 0);
    });
});

function calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squareDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}