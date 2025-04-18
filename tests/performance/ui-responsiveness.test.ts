import * as assert from 'assert';
import * as vscode from 'vscode';
import { WebviewPanel } from '../../src/webview/webviewPanel';
import { UIManager } from '../../src/ui/uiManager';
import { PerformanceManager } from '../../src/performance/performanceManager';

describe('UI Responsiveness Tests', () => {
    let uiManager: UIManager;
    let performanceManager: PerformanceManager;
    let webviewPanel: WebviewPanel;
    let messageQueue: Array<{ type: string; data: any }> = [];

    // Mock WebView implementation for testing
    class MockWebview implements vscode.Webview {
        html: string = '';
        options = {};
        cspSource: string = '';
        onDidReceiveMessage: vscode.Event<any>;
        private messageEmitter = new vscode.EventEmitter<any>();

        constructor() {
            this.onDidReceiveMessage = this.messageEmitter.event;
        }

        async postMessage(message: any): Promise<boolean> {
            messageQueue.push(message);
            return true;
        }

        asWebviewUri(resource: vscode.Uri): vscode.Uri {
            return resource;
        }
    }

    beforeEach(() => {
        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: '/test/path',
            storagePath: '/test/storage'
        } as any as vscode.ExtensionContext;

        // Initialize components
        performanceManager = PerformanceManager.getInstance();
        performanceManager.setEnabled(true);
        
        const mockWebview = new MockWebview();
        webviewPanel = new WebviewPanel(mockWebview);
        uiManager = new UIManager(context, webviewPanel);
        
        // Clear message queue
        messageQueue = [];
    });

    test('handles rapid UI updates efficiently', async () => {
        const updateCount = 100;
        const measurePoints: number[] = [];
        
        // Perform rapid updates
        for (let i = 0; i < updateCount; i++) {
            const startTime = performance.now();
            
            await webviewPanel.postMessage({
                type: 'update',
                data: {
                    id: `item-${i}`,
                    content: `Test content ${i}`,
                    timestamp: Date.now()
                }
            });

            measurePoints.push(performance.now() - startTime);
            
            // Add minimal delay to simulate real-world conditions
            await new Promise(resolve => setTimeout(resolve, 5));
        }

        // Calculate performance metrics
        const avgUpdateTime = measurePoints.reduce((a, b) => a + b, 0) / measurePoints.length;
        const maxUpdateTime = Math.max(...measurePoints);
        const p95UpdateTime = measurePoints.sort((a, b) => a - b)[Math.floor(measurePoints.length * 0.95)];

        // Verify performance thresholds
        assert.ok(avgUpdateTime < 16, `Average update time ${avgUpdateTime}ms exceeds 16ms frame budget`);
        assert.ok(maxUpdateTime < 100, `Max update time ${maxUpdateTime}ms exceeds threshold`);
        assert.ok(p95UpdateTime < 50, `95th percentile update time ${p95UpdateTime}ms exceeds threshold`);
    });

    test('maintains responsiveness with large datasets', async () => {
        const largeDataset = Array(1000).fill(null).map((_, i) => ({
            id: `item-${i}`,
            title: `Test Item ${i}`,
            description: 'A'.repeat(1000), // 1KB of text per item
            metadata: {
                timestamp: Date.now(),
                category: i % 5,
                tags: Array(10).fill(null).map((_, j) => `tag-${j}`)
            }
        }));

        const batchSizes = [10, 50, 100, 500, 1000];
        const renderTimes = new Map<number, number>();

        for (const batchSize of batchSizes) {
            const startTime = performance.now();
            
            // Send data in batches
            for (let i = 0; i < largeDataset.length; i += batchSize) {
                const batch = largeDataset.slice(i, i + batchSize);
                await webviewPanel.postMessage({
                    type: 'updateDataset',
                    data: { items: batch }
                });
            }

            renderTimes.set(batchSize, performance.now() - startTime);
        }

        // Analyze performance characteristics
        const timings = Array.from(renderTimes.entries());
        
        // Verify batch processing efficiency
        for (let i = 1; i < timings.length; i++) {
            const [prevBatch, prevTime] = timings[i - 1];
            const [currBatch, currTime] = timings[i];
            
            // Larger batches should be more efficient per item
            const prevTimePerItem = prevTime / prevBatch;
            const currTimePerItem = currTime / currBatch;
            
            assert.ok(
                currTimePerItem <= prevTimePerItem * 1.5,
                `Processing efficiency decreased significantly for batch size ${currBatch}`
            );
        }
    });

    test('handles concurrent UI operations without blocking', async () => {
        const operations = 20;
        const operationTypes = ['update', 'scroll', 'filter', 'search'];
        const completionTimes = new Map<string, number[]>();

        // Initialize timing arrays
        operationTypes.forEach(type => completionTimes.set(type, []));

        // Perform concurrent operations
        const operationPromises = Array(operations).fill(null).map(async (_, i) => {
            for (const type of operationTypes) {
                const startTime = performance.now();
                
                await webviewPanel.postMessage({
                    type,
                    data: {
                        id: `op-${i}`,
                        operationType: type,
                        timestamp: Date.now()
                    }
                });

                completionTimes.get(type)?.push(performance.now() - startTime);
            }
        });

        await Promise.all(operationPromises);

        // Calculate statistics for each operation type
        for (const [type, timings] of completionTimes.entries()) {
            const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
            const maxTime = Math.max(...timings);
            
            // Verify responsiveness thresholds
            assert.ok(avgTime < 50, `Average time for ${type} (${avgTime}ms) exceeds threshold`);
            assert.ok(maxTime < 200, `Maximum time for ${type} (${maxTime}ms) exceeds threshold`);
        }
    });

    test('manages memory usage during intensive UI updates', async () => {
        const iterations = 50;
        const componentsPerIteration = 20;
        const heapMeasurements: number[] = [];
        
        // Record initial heap usage
        heapMeasurements.push(process.memoryUsage().heapUsed);

        // Perform intensive UI updates
        for (let i = 0; i < iterations; i++) {
            // Create complex nested components
            const components = Array(componentsPerIteration).fill(null).map((_, j) => ({
                id: `component-${i}-${j}`,
                type: j % 4 === 0 ? 'list' : j % 4 === 1 ? 'tree' : j % 4 === 2 ? 'grid' : 'chart',
                data: Array(50).fill(null).map((_, k) => ({
                    id: `item-${k}`,
                    value: Math.random() * 1000,
                    metadata: {
                        timestamp: Date.now(),
                        category: k % 5,
                        tags: Array(5).fill(null).map((_, l) => `tag-${l}`)
                    }
                }))
            }));

            // Update UI with new components
            await webviewPanel.postMessage({
                type: 'updateComponents',
                data: { components }
            });

            // Measure heap usage
            heapMeasurements.push(process.memoryUsage().heapUsed);

            // Allow time for GC if needed
            if (i % 10 === 0 && global.gc) {
                global.gc();
            }
        }

        // Calculate memory growth characteristics
        const memoryGrowth = heapMeasurements[heapMeasurements.length - 1] - heapMeasurements[0];
        const avgGrowthPerIteration = memoryGrowth / iterations;
        
        // Verify memory management
        assert.ok(memoryGrowth < 50 * 1024 * 1024, `Total memory growth ${memoryGrowth} bytes exceeds threshold`);
        assert.ok(avgGrowthPerIteration < 1024 * 1024, `Average memory growth per iteration ${avgGrowthPerIteration} bytes exceeds threshold`);

        // Verify message processing remained efficient
        assert.ok(
            messageQueue.length === iterations,
            `Message queue length ${messageQueue.length} doesn't match iterations ${iterations}`
        );
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