import * as assert from 'assert';
import * as vscode from 'vscode';
import { LLMProviderManager } from '../../src/llm/llmProviderManager';
import { ModelManager } from '../../src/models/modelManager';
import { PerformanceManager } from '../../src/performance/performanceManager';
import { TokenManager } from '../../src/llm/tokenManager';

describe('LLM Stress Testing', () => {
    let llmProviderManager: LLMProviderManager;
    let modelManager: ModelManager;
    let performanceManager: PerformanceManager;
    let tokenManager: TokenManager;

    beforeEach(async () => {
        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: '/test/path',
            storagePath: '/test/storage'
        } as any as vscode.ExtensionContext;

        llmProviderManager = LLMProviderManager.getInstance();
        modelManager = new ModelManager();
        performanceManager = PerformanceManager.getInstance();
        tokenManager = new TokenManager();

        // Initialize performance monitoring
        performanceManager.setEnabled(true);
    });

    test('handles rapid request bursts within rate limits', async () => {
        const burstSize = 10;
        const requestIntervals = [0, 50, 100, 200]; // ms
        const results = new Map<number, { success: number; failure: number }>();

        for (const interval of requestIntervals) {
            const responses = await Promise.all(
                Array(burstSize).fill(null).map(async (_, i) => {
                    if (interval > 0) {
                        await new Promise(resolve => setTimeout(resolve, interval * i));
                    }
                    
                    try {
                        const response = await llmProviderManager.getActiveProvider()?.generateCompletion(
                            'model1',
                            'Quick test prompt ' + i,
                            undefined,
                            { temperature: 0.7 }
                        );
                        return { success: true, response };
                    } catch (error) {
                        return { success: false, error };
                    }
                })
            );

            results.set(interval, {
                success: responses.filter(r => r.success).length,
                failure: responses.filter(r => !r.success).length
            });
        }

        // Verify rate limiting behavior
        const metrics = await performanceManager.getMetrics();
        
        // Slower intervals should have higher success rates
        const successRates = Array.from(results.entries())
            .map(([interval, result]) => ({ 
                interval, 
                rate: result.success / burstSize 
            }));

        // Success rate should improve with longer intervals
        for (let i = 1; i < successRates.length; i++) {
            assert.ok(
                successRates[i].rate >= successRates[i-1].rate,
                `Success rate should improve with longer intervals`
            );
        }

        // Verify response times stayed within acceptable range
        assert.ok(metrics.responseTime < 2000, 'Response time exceeded threshold');
    });

    test('manages token limits correctly under load', async () => {
        const testPrompts = [
            'short prompt',
            'medium length prompt with some additional context about the task',
            'A'.repeat(1000), // Long prompt
            'B'.repeat(2000)  // Very long prompt
        ];

        for (const prompt of testPrompts) {
            const tokenCount = await tokenManager.countTokens(prompt);
            const maxTokens = await tokenManager.getMaxTokens('model1');
            
            if (tokenCount > maxTokens) {
                // Should throw error for exceeding token limit
                await assert.rejects(
                    async () => {
                        await llmProviderManager.getActiveProvider()?.generateCompletion(
                            'model1',
                            prompt,
                            undefined,
                            { temperature: 0.7 }
                        );
                    },
                    /Token limit exceeded/
                );
            } else {
                // Should handle within token limit
                const response = await llmProviderManager.getActiveProvider()?.generateCompletion(
                    'model1',
                    prompt,
                    undefined,
                    { temperature: 0.7 }
                );
                assert.ok(response?.content);
            }
        }
    });

    test('handles concurrent streaming connections', async () => {
        const streamCount = 5;
        const responses = new Map<number, string[]>();
        const errors = new Map<number, Error>();

        // Start multiple streams simultaneously
        const streamPromises = Array(streamCount).fill(null).map(async (_, i) => {
            const chunks: string[] = [];
            try {
                await llmProviderManager.getActiveProvider()?.streamCompletion(
                    'model1',
                    `Stream test ${i}`,
                    undefined,
                    { temperature: 0.7 },
                    (event) => {
                        chunks.push(event.content);
                    }
                );
                responses.set(i, chunks);
            } catch (error) {
                errors.set(i, error as Error);
            }
        });

        await Promise.all(streamPromises);

        // Verify stream integrity
        assert.strictEqual(responses.size + errors.size, streamCount, 'All streams should complete');
        
        // Each successful stream should have content
        for (const chunks of responses.values()) {
            assert.ok(chunks.length > 0, 'Stream should have content');
            // Verify chunks can be concatenated into valid content
            const fullContent = chunks.join('');
            assert.ok(fullContent.length > 0);
        }
    });

    test('recovers from provider errors under load', async () => {
        const operations = 20;
        const results = new Map<number, boolean>();
        let consecutiveFailures = 0;
        const maxConsecutiveFailures = 3;

        // Simulate provider errors and recovery
        for (let i = 0; i < operations; i++) {
            try {
                if (consecutiveFailures >= maxConsecutiveFailures) {
                    // Force provider reconnect after too many failures
                    await llmProviderManager.getActiveProvider()?.disconnect();
                    await new Promise(resolve => setTimeout(resolve, 100));
                    consecutiveFailures = 0;
                }

                const response = await llmProviderManager.getActiveProvider()?.generateCompletion(
                    'model1',
                    `Recovery test ${i}`,
                    undefined,
                    { temperature: 0.7 }
                );

                results.set(i, !!response?.content);
                consecutiveFailures = 0;
            } catch (error) {
                results.set(i, false);
                consecutiveFailures++;
            }

            // Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Calculate success rate
        const successCount = Array.from(results.values()).filter(success => success).length;
        const successRate = successCount / operations;

        // Success rate should be reasonable even with errors
        assert.ok(successRate > 0.7, `Success rate ${successRate} below threshold`);
    });

    test('maintains response quality under load', async () => {
        const testCases = [
            { prompt: 'Simple addition', expectedPattern: /\d+\s*\+\s*\d+/ },
            { prompt: 'Basic function', expectedPattern: /function\s+\w+\s*\(.*\)/ },
            { prompt: 'Variable declaration', expectedPattern: /(const|let|var)\s+\w+/ }
        ];

        const iterations = 5;
        const results = new Map<string, { valid: number, total: number }>();

        // Run test cases multiple times under load
        for (const testCase of testCases) {
            const stats = { valid: 0, total: 0 };
            
            for (let i = 0; i < iterations; i++) {
                const response = await llmProviderManager.getActiveProvider()?.generateCompletion(
                    'model1',
                    testCase.prompt,
                    undefined,
                    { temperature: 0.7 }
                );

                if (response?.content) {
                    stats.total++;
                    if (testCase.expectedPattern.test(response.content)) {
                        stats.valid++;
                    }
                }
            }

            results.set(testCase.prompt, stats);
        }

        // Verify response quality
        for (const [prompt, stats] of results.entries()) {
            const qualityRate = stats.valid / stats.total;
            assert.ok(
                qualityRate >= 0.8,
                `Quality rate ${qualityRate} for "${prompt}" below threshold`
            );
        }
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