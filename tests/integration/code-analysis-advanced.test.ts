import * as assert from 'assert';
import * as vscode from 'vscode';
import { CodeAnalyzer } from '../../src/services/codeQuality/codeAnalyzer';
import { DependencyGraph } from '../../src/tools/dependencyAnalyzer';
import { MetricsCollector } from '../../src/services/codeQuality/metricsCollector';
import { ComplexityAnalyzer } from '../../src/services/codeQuality/complexityAnalyzer';
import { WorkspaceManager } from '../../src/services/WorkspaceManager';

describe('Advanced Code Analysis', () => {
    let codeAnalyzer: CodeAnalyzer;
    let dependencyGraph: DependencyGraph;
    let metricsCollector: MetricsCollector;
    let complexityAnalyzer: ComplexityAnalyzer;
    let workspaceManager: WorkspaceManager;
    let testWorkspace: string;

    beforeEach(async () => {
        // Create mock extension context
        const context = {
            subscriptions: [],
            workspaceState: new MockMemento(),
            globalState: new MockMemento(),
            extensionPath: '/test/path',
            storagePath: '/test/storage'
        } as any as vscode.ExtensionContext;

        workspaceManager = WorkspaceManager.getInstance();
        codeAnalyzer = new CodeAnalyzer(workspaceManager);
        dependencyGraph = new DependencyGraph();
        metricsCollector = new MetricsCollector();
        complexityAnalyzer = new ComplexityAnalyzer();
    });

    test('analyzes complex circular dependencies', async () => {
        const files = [
            {
                path: '/src/moduleA.ts',
                content: `
                    import { funcB } from './moduleB';
                    import { funcC } from './moduleC';
                    export function funcA() {
                        return funcB() + funcC();
                    }
                `
            },
            {
                path: '/src/moduleB.ts',
                content: `
                    import { funcC } from './moduleC';
                    import { funcA } from './moduleA';
                    export function funcB() {
                        return funcC() + funcA();
                    }
                `
            },
            {
                path: '/src/moduleC.ts',
                content: `
                    import { funcA } from './moduleA';
                    import { funcB } from './moduleB';
                    export function funcC() {
                        return funcA() + funcB();
                    }
                `
            }
        ];

        // Analyze circular dependencies
        const graph = await dependencyGraph.buildFromFiles(files);
        const cycles = await dependencyGraph.findCycles(graph);

        // Verify cycle detection
        assert.ok(cycles.length > 0, 'Should detect circular dependencies');
        assert.ok(cycles.some(cycle => 
            cycle.includes('moduleA') && 
            cycle.includes('moduleB') && 
            cycle.includes('moduleC')
        ), 'Should identify the specific circular dependency chain');
    });

    test('handles large-scale dependency analysis', async () => {
        // Generate a large synthetic codebase
        const fileCount = 1000;
        const files = Array(fileCount).fill(null).map((_, i) => {
            const dependencies = Array(5).fill(null).map(() => 
                Math.floor(Math.random() * fileCount)
            ).filter(dep => dep !== i);

            return {
                path: `/src/module${i}.ts`,
                content: `
                    ${dependencies.map(dep => 
                        `import { func${dep} } from './module${dep}';`
                    ).join('\n')}
                    export function func${i}() {
                        return ${dependencies.map(dep => 
                            `func${dep}()`
                        ).join(' + ')};
                    }
                `
            };
        });

        const startTime = process.hrtime();
        const graph = await dependencyGraph.buildFromFiles(files);
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const analysisTime = seconds * 1000 + nanoseconds / 1000000;

        // Verify performance characteristics
        assert.ok(analysisTime < 10000, `Analysis time ${analysisTime}ms exceeded threshold`);
        assert.ok(Object.keys(graph.nodes).length === fileCount, 'Should process all files');
    });

    test('calculates accurate complexity metrics', async () => {
        const complexCode = `
            function processData(data: any[]): any {
                let result = [];
                for (let i = 0; i < data.length; i++) {
                    if (data[i].type === 'A') {
                        for (let j = 0; j < data[i].items.length; j++) {
                            if (data[i].items[j].status === 'active') {
                                switch (data[i].items[j].category) {
                                    case 'high':
                                        result.push(processHighPriority(data[i].items[j]));
                                        break;
                                    case 'medium':
                                        if (checkCondition(data[i].items[j])) {
                                            result.push(processMediumPriority(data[i].items[j]));
                                        }
                                        break;
                                    default:
                                        result.push(processLowPriority(data[i].items[j]));
                                }
                            }
                        }
                    }
                }
                return result;
            }
        `;

        const metrics = await complexityAnalyzer.analyze(complexCode);

        // Verify complexity metrics
        assert.ok(metrics.cyclomaticComplexity > 10, 'Should identify high cyclomatic complexity');
        assert.ok(metrics.nestingDepth > 4, 'Should identify deep nesting');
        assert.ok(metrics.cognitiveComplexity > 15, 'Should identify high cognitive complexity');
    });

    test('identifies code duplication patterns', async () => {
        const files = [
            {
                path: '/src/handler1.ts',
                content: `
                    export function handleRequest1(req: any) {
                        const data = validateInput(req);
                        if (!data) return { error: 'Invalid input' };
                        const result = processData(data);
                        if (!result) return { error: 'Processing failed' };
                        return { success: true, data: result };
                    }
                `
            },
            {
                path: '/src/handler2.ts',
                content: `
                    export function handleRequest2(req: any) {
                        const data = validateInput(req);
                        if (!data) return { error: 'Invalid input' };
                        const result = processData(data);
                        if (!result) return { error: 'Processing failed' };
                        return { success: true, data: result };
                    }
                `
            },
            {
                path: '/src/handler3.ts',
                content: `
                    export function handleRequest3(req: any) {
                        const data = validateInput(req);
                        if (!data) return { error: 'Invalid input' };
                        const result = processData(data);
                        if (!result) return { error: 'Processing failed' };
                        return { success: true, data: result };
                    }
                `
            }
        ];

        const duplicates = await codeAnalyzer.findDuplication(files);

        // Verify duplication detection
        assert.ok(duplicates.length > 0, 'Should detect code duplication');
        assert.ok(duplicates.some(d => d.similarity > 0.9), 'Should identify high similarity');
        assert.ok(
            duplicates.some(d => 
                d.locations.length === 3 && 
                d.locations.every(l => l.path.includes('handler'))
            ),
            'Should identify all instances of duplication'
        );
    });

    test('analyzes code quality trends over time', async () => {
        const codeVersions = Array(10).fill(null).map((_, version) => ({
            timestamp: new Date() - version * 86400000, // Daily intervals
            files: [
                {
                    path: '/src/main.ts',
                    content: `
                        function processData${version}(data: any) {
                            ${Array(version + 1).fill(null).map(() => 
                                'if (condition) { doSomething(); }'
                            ).join('\n')}
                            return result;
                        }
                    `
                }
            ]
        }));

        const trends = await Promise.all(
            codeVersions.map(async version => ({
                timestamp: version.timestamp,
                metrics: await Promise.all(version.files.map(file => 
                    metricsCollector.collectMetrics(file.content)
                ))
            }))
        );

        // Analyze trends
        const complexityTrend = trends.map(t => ({
            timestamp: t.timestamp,
            avgComplexity: t.metrics.reduce((sum, m) => sum + m.complexity, 0) / t.metrics.length
        }));

        // Verify trend analysis
        assert.ok(
            complexityTrend[0].avgComplexity > complexityTrend[complexityTrend.length - 1].avgComplexity,
            'Should detect increasing complexity trend'
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