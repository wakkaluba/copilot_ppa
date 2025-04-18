import * as assert from 'assert';
import * as vscode from 'vscode';
import { ContextManager } from '../../src/services/ContextManager';
import { ConversationManager } from '../../src/services/ConversationManager';
import { ConversationHistory } from '../../src/services/ConversationHistory';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ModelManager } from '../../src/models/modelManager';
import { PerformanceManager } from '../../src/performance/performanceManager';

describe('Resource Management and Performance', () => {
    let contextManager: ContextManager;
    let conversationManager: ConversationManager;
    let llmProviderManager: LLMProviderManager;
    let modelManager: ModelManager;
    let performanceManager: PerformanceManager;
    let history: ConversationHistory;

    beforeEach(async () => {
        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: '/test/path',
            storagePath: '/test/storage'
        } as any as vscode.ExtensionContext;

        history = new ConversationHistory(context);
        await history.initialize();
        
        contextManager = ContextManager.getInstance(history);
        conversationManager = ConversationManager.getInstance();
        llmProviderManager = LLMProviderManager.getInstance();
        modelManager = new ModelManager();
        performanceManager = PerformanceManager.getInstance();
    });

    test('memory usage remains stable during long conversations', async () => {
        const conversationId = 'perf-test-1';
        await conversationManager.startNewConversation('Performance Test 1');

        const initialHeap = process.memoryUsage().heapUsed;
        const messageSizes = [1000, 5000, 10000, 50000]; // bytes
        const messagesPerSize = 10;
        const heapMeasurements: number[] = [initialHeap];

        // Generate and process messages of increasing size
        for (const size of messageSizes) {
            const message = 'A'.repeat(size);
            
            for (let i = 0; i < messagesPerSize; i++) {
                await conversationManager.addMessage('user', `${message} - ${i}`);
                await conversationManager.addMessage('assistant', `Response to: ${message.substring(0, 20)}...`);
                
                // Build context after each message pair
                await contextManager.buildPrompt(conversationId, 'Next message');
                
                // Measure heap after each iteration
                heapMeasurements.push(process.memoryUsage().heapUsed);
            }
            
            // Force GC if available
            if (global.gc) {
                global.gc();
            }
        }

        // Calculate heap growth statistics
        const heapGrowthRates = [];
        for (let i = 1; i < heapMeasurements.length; i++) {
            const growth = heapMeasurements[i] - heapMeasurements[i - 1];
            heapGrowthRates.push(growth);
        }

        // Calculate average growth rate
        const avgGrowthRate = heapGrowthRates.reduce((a, b) => a + b, 0) / heapGrowthRates.length;
        
        // Verify memory growth is not exponential
        // Growth rate should decrease as size increases
        const maxAcceptableGrowth = 1024 * 1024 * 50; // 50MB
        assert.ok(avgGrowthRate < maxAcceptableGrowth, 
            `Average heap growth rate ${avgGrowthRate} bytes exceeds threshold ${maxAcceptableGrowth} bytes`);
    });

    test('context switching performance remains consistent', async () => {
        const contextCount = 10;
        const operationsPerContext = 50;
        const timings: number[] = [];

        // Create multiple contexts and measure switch times
        for (let i = 0; i < contextCount; i++) {
            const conversationId = `perf-test-context-${i}`;
            await conversationManager.startNewConversation(`Performance Test Context ${i}`);
            
            // Add some initial context
            await contextManager.updateContext(conversationId, {
                activeFile: `test${i}.ts`,
                selectedCode: `function test${i}() { /* Some code */ }`,
                codeLanguage: 'typescript'
            });

            // Measure context switching operations
            for (let j = 0; j < operationsPerContext; j++) {
                const startTime = process.hrtime();
                
                // Perform context switch operation
                await contextManager.buildPrompt(conversationId, `Operation ${j}`);
                
                const [seconds, nanoseconds] = process.hrtime(startTime);
                timings.push(seconds * 1000 + nanoseconds / 1000000); // Convert to milliseconds
            }
        }

        // Calculate timing statistics
        const avgSwitchTime = timings.reduce((a, b) => a + b, 0) / timings.length;
        const maxSwitchTime = Math.max(...timings);
        const p95SwitchTime = timings.sort((a, b) => a - b)[Math.floor(timings.length * 0.95)];

        // Verify performance metrics
        assert.ok(avgSwitchTime < 100, `Average context switch time ${avgSwitchTime}ms exceeds threshold`);
        assert.ok(maxSwitchTime < 500, `Maximum context switch time ${maxSwitchTime}ms exceeds threshold`);
        assert.ok(p95SwitchTime < 200, `95th percentile switch time ${p95SwitchTime}ms exceeds threshold`);
    });

    test('handles concurrent resource-intensive operations', async () => {
        const operationCount = 5;
        const startTime = process.hrtime();
        
        // Create multiple resource-intensive operations
        const operations = Array(operationCount).fill(null).map(async (_, i) => {
            const conversationId = `perf-test-concurrent-${i}`;
            await conversationManager.startNewConversation(`Concurrent Test ${i}`);

            // Perform multiple operations concurrently
            return Promise.all([
                // Large context update
                contextManager.updateContext(conversationId, {
                    activeFile: `test${i}.ts`,
                    selectedCode: 'A'.repeat(10000),
                    codeLanguage: 'typescript'
                }),

                // Message processing
                conversationManager.addMessage('user', 'B'.repeat(10000)),

                // Context building
                contextManager.buildPrompt(conversationId, 'C'.repeat(1000)),

                // Model interaction
                llmProviderManager.getActiveProvider()?.generateCompletion(
                    'model1',
                    'D'.repeat(1000),
                    undefined,
                    { temperature: 0.7 }
                )
            ]);
        });

        // Wait for all operations to complete
        await Promise.all(operations);

        const [seconds, nanoseconds] = process.hrtime(startTime);
        const totalTime = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

        // Verify performance
        assert.ok(totalTime < 5000, `Concurrent operations took ${totalTime}ms, exceeding threshold`);

        // Check resource cleanup
        if (global.gc) {
            global.gc();
        }
        
        const finalHeap = process.memoryUsage().heapUsed;
        const maxAcceptableHeap = 200 * 1024 * 1024; // 200MB
        assert.ok(finalHeap < maxAcceptableHeap, 
            `Final heap usage ${finalHeap} bytes exceeds threshold ${maxAcceptableHeap} bytes`);
    });

    test('maintains response time under load', async () => {
        const iterations = 20;
        const responseTimestamps: number[] = [];
        
        // Set up performance monitoring
        performanceManager.setEnabled(true);

        for (let i = 0; i < iterations; i++) {
            const startTime = Date.now();
            
            // Simulate user interaction under load
            await Promise.all([
                // Main interaction
                llmProviderManager.getActiveProvider()?.generateCompletion(
                    'model1',
                    'Test prompt under load',
                    undefined,
                    { temperature: 0.7 }
                ),

                // Background operations
                contextManager.updateContext(`load-test-${i}`, {
                    activeFile: `test${i}.ts`,
                    selectedCode: `function test${i}() {}`,
                    codeLanguage: 'typescript'
                }),
                
                conversationManager.addMessage('user', `Test message ${i}`),
                
                // Simulate UI updates
                new Promise(resolve => setTimeout(resolve, Math.random() * 100))
            ]);

            responseTimestamps.push(Date.now() - startTime);
        }

        // Calculate response time statistics
        const avgResponseTime = responseTimestamps.reduce((a, b) => a + b, 0) / responseTimestamps.length;
        const maxResponseTime = Math.max(...responseTimestamps);
        const p95ResponseTime = responseTimestamps.sort((a, b) => a - b)[Math.floor(responseTimestamps.length * 0.95)];

        // Get performance metrics
        const metrics = await performanceManager.getMetrics();

        // Verify performance metrics
        assert.ok(avgResponseTime < 1000, `Average response time ${avgResponseTime}ms exceeds threshold`);
        assert.ok(maxResponseTime < 2000, `Maximum response time ${maxResponseTime}ms exceeds threshold`);
        assert.ok(p95ResponseTime < 1500, `95th percentile response time ${p95ResponseTime}ms exceeds threshold`);
        assert.ok(metrics.responseTime < 1000, `Overall response time metric ${metrics.responseTime}ms exceeds threshold`);
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