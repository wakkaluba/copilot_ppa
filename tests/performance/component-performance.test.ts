import * as assert from 'assert';
import { performance } from 'perf_hooks';
import { LLMProviderManager } from '../../src/llm/llm-provider-manager';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';

describe('Component Performance Tests', () => {
    let llmManager: LLMProviderManager;
    let contextManager: ContextManager;
    let workspaceManager: WorkspaceManager;
    let history: ConversationHistory;

    beforeEach(() => {
        llmManager = LLMProviderManager.getInstance();
        history = new ConversationHistory();
        contextManager = ContextManager.getInstance(history);
        workspaceManager = new WorkspaceManager();
    });

    test('handles large conversations without memory leaks', async () => {
        const messagesCount = 100;
        const messageSize = 1000; // characters
        const conversationId = 'perf-test-conversation';
        const longMessage = 'A'.repeat(messageSize);

        // Record initial heap
        const initialHeap = process.memoryUsage().heapUsed;

        // Add many messages
        for (let i = 0; i < messagesCount; i++) {
            await history.addMessage(
                conversationId,
                i % 2 === 0 ? 'user' : 'assistant',
                `${longMessage} - ${i}`
            );
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
        const linesOfCode = Array(lineCount)
            .fill(null)
            .map((_, i) => `console.log("Line ${i}");`)
            .join('\n');

        const startTime = performance.now();
        
        // Write large file
        await workspaceManager.writeFile('large-test.js', linesOfCode);
        
        // Read and process file
        const content = await workspaceManager.readFile('large-test.js');
        const lines = content.split('\n');
        
        const processingTime = performance.now() - startTime;
        const timePerLine = processingTime / lineCount;

        // Verify processing speed
        assert.ok(lines.length === lineCount);
        assert.ok(
            timePerLine < 0.1, // Less than 0.1ms per line
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
        for (let i = 1; i < results.length; i++) {
            const timeIncrease = results[i].time / results[i - 1].time;
            const sizeIncrease = results[i].size / results[i - 1].size;
            
            // Time shouldn't increase faster than O(log n) with size
            assert.ok(
                timeIncrease < sizeIncrease,
                `Performance degradation (${timeIncrease.toFixed(2)}x) is worse than size increase (${sizeIncrease}x)`
            );
        }
    });

    test('streaming response memory stability', async () => {
        const streamDuration = 10000; // 10 seconds
        const samplingInterval = 1000; // 1 second
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
            (event) => {
                streamedContent += event.content;
            }
        );

        // Monitor memory usage during streaming
        const monitoringPromise = new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                memoryReadings.push(process.memoryUsage().heapUsed);
                
                if (performance.now() - startTime >= streamDuration) {
                    clearInterval(interval);
                    resolve();
                }
            }, samplingInterval);
        });

        const startTime = performance.now();
        await Promise.all([streamPromise, monitoringPromise]);

        // Calculate memory stability metrics
        const memoryVariance = calculateVariance(memoryReadings);
        const maxMemoryIncrease = Math.max(...memoryReadings) - memoryReadings[0];

        // Verify memory stability
        assert.ok(streamedContent.length > 0);
        assert.ok(
            maxMemoryIncrease < 50 * 1024 * 1024, // Less than 50MB increase
            `Maximum memory increase (${maxMemoryIncrease} bytes) exceeds threshold`
        );
        assert.ok(
            memoryVariance < 1000000, // Low variance indicates stable memory usage
            `Memory usage variance (${memoryVariance}) indicates instability`
        );
    });
});

function calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squareDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
}