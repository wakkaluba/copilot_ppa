import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PerformanceAnalyzerService } from '../../../../src/performance/services/PerformanceAnalyzerService';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('PerformanceAnalyzerService Tests', () => {
    let service: PerformanceAnalyzerService;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        service = new PerformanceAnalyzerService(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Service Initialization', () => {
        test('initializes with correct analyzers', () => {
            assert.ok(service.hasAnalyzer('javascript'));
            assert.ok(service.hasAnalyzer('typescript'));
            assert.ok(service.hasAnalyzer('python'));
            assert.ok(service.hasAnalyzer('java'));
        });

        test('registers appropriate file extensions', () => {
            assert.ok(service.canAnalyze('.js'));
            assert.ok(service.canAnalyze('.ts'));
            assert.ok(service.canAnalyze('.py'));
            assert.ok(service.canAnalyze('.java'));
        });
    });

    suite('Document Analysis', () => {
        test('analyzes JavaScript document', async () => {
            const mockDocument = createMockDocument(`
                function heavyComputation() {
                    for(let i = 0; i < 1000000; i++) {
                        for(let j = 0; j < 1000000; j++) {
                            let result = Math.pow(i, j);
                        }
                    }
                }
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.length > 0);
            assert.ok(results.issues.some(i => i.type === 'performance'));
        });

        test('analyzes TypeScript document', async () => {
            const mockDocument = createMockDocument(`
                class MemoryTest {
                    private items: string[] = [];
                    public addItems(): void {
                        setInterval(() => {
                            this.items.push("test");
                        }, 100);
                    }
                }
            `, 'typescript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'memory-leak'));
        });
    });

    suite('Performance Metrics', () => {
        test('tracks analysis time', async () => {
            const mockDocument = createMockDocument('console.log("test");', 'javascript');
            const startTime = Date.now();
            await service.analyzeDocument(mockDocument);
            const metrics = service.getMetrics();

            assert.ok(metrics.lastAnalysisTime > 0);
            assert.ok(metrics.lastAnalysisTime <= Date.now() - startTime);
        });

        test('tracks issue counts', async () => {
            const mockDocument = createMockDocument(`
                function inefficientCode() {
                    let str = '';
                    for(let i = 0; i < 1000; i++) {
                        str += i.toString();
                    }
                }
            `, 'javascript');

            await service.analyzeDocument(mockDocument);
            const metrics = service.getMetrics();

            assert.ok(metrics.totalIssuesFound > 0);
            assert.ok(metrics.issuesByType.performance > 0);
        });
    });

    suite('Analysis Configuration', () => {
        test('respects severity thresholds', async () => {
            service.setConfiguration({ minSeverity: 'warning' });
            const mockDocument = createMockDocument(`
                // Minor inefficiency
                let arr = [1,2,3];
                arr.forEach(x => console.log(x));
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.every(i => i.severity !== 'info'));
        });

        test('handles file size limits', async () => {
            service.setConfiguration({ maxFileSizeKB: 1 });
            const largeContent = 'x'.repeat(2000);
            const mockDocument = createMockDocument(largeContent, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.skipped);
            assert.ok(results.skipReason?.includes('file size'));
        });
    });

    suite('Performance Recommendations', () => {
        test('generates code improvement suggestions', async () => {
            const mockDocument = createMockDocument(`
                function inefficientSearch(arr, target) {
                    return arr.indexOf(target) >= 0;
                }
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            const recommendations = service.generateRecommendations(results);

            assert.ok(recommendations.length > 0);
            assert.ok(recommendations.some(r => r.toLowerCase().includes('set')));
        });

        test('provides optimization examples', async () => {
            const mockDocument = createMockDocument(`
                const items = [];
                for(let i = 0; i < 1000; i++) {
                    items.push(i);
                }
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            const examples = service.getOptimizationExamples(results);

            assert.ok(examples.length > 0);
            assert.ok(examples.some(e => e.optimized.includes('Array(1000)')));
        });
    });

    suite('Resource Analysis', () => {
        test('analyzes memory usage patterns', async () => {
            const mockDocument = createMockDocument(`
                class Cache {
                    private static instance: Cache;
                    private cache: Map<string, any> = new Map();

                    public add(key: string, value: any): void {
                        this.cache.set(key, value);
                    }
                }
            `, 'typescript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'memory-management'));
        });

        test('detects CPU-intensive patterns', async () => {
            const mockDocument = createMockDocument(`
                function fibonacci(n: number): number {
                    if (n <= 1) return n;
                    return fibonacci(n - 1) + fibonacci(n - 2);
                }
            `, 'typescript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'cpu-intensive'));
        });
    });

    suite('Error Handling', () => {
        test('handles analyzer errors gracefully', async () => {
            const mockDocument = createMockDocument('invalid syntax', 'javascript');
            sandbox.stub(service as any, 'getAnalyzer').throws(new Error('Analyzer error'));

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.error);
            assert.ok(results.error.includes('Analyzer error'));
        });

        test('handles invalid file types', async () => {
            const mockDocument = createMockDocument('test', 'unknown');
            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.skipped);
            assert.ok(results.skipReason?.includes('unsupported'));
        });
    });
});
