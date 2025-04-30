import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ComplexityAnalyzer } from '../../../../src/services/codeTools/complexityAnalyzer';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('ComplexityAnalyzer Tests', () => {
    let analyzer: ComplexityAnalyzer;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();
        analyzer = new ComplexityAnalyzer(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    suite('Cyclomatic Complexity', () => {
        test('calculates simple function complexity', async () => {
            const mockDocument = createMockDocument(`
                function simpleFunction(a) {
                    return a + 1;
                }
            `);

            const analysis = await analyzer.analyzeCyclomaticComplexity(mockDocument);
            assert.strictEqual(analysis.functions[0].complexity, 1);
        });

        test('calculates branching complexity', async () => {
            const mockDocument = createMockDocument(`
                function branchingFunction(a, b) {
                    if (a > 0) {
                        if (b > 0) {
                            return 1;
                        } else {
                            return 2;
                        }
                    }
                    return 3;
                }
            `);

            const analysis = await analyzer.analyzeCyclomaticComplexity(mockDocument);
            assert.strictEqual(analysis.functions[0].complexity, 3);
        });

        test('analyzes switch statements', async () => {
            const mockDocument = createMockDocument(`
                function switchFunction(type) {
                    switch (type) {
                        case 'a': return 1;
                        case 'b': return 2;
                        case 'c': return 3;
                        default: return 0;
                    }
                }
            `);

            const analysis = await analyzer.analyzeCyclomaticComplexity(mockDocument);
            assert.strictEqual(analysis.functions[0].complexity, 4);
        });
    });

    suite('Cognitive Complexity', () => {
        test('calculates nested loop complexity', async () => {
            const mockDocument = createMockDocument(`
                function nestedLoops() {
                    for (let i = 0; i < 10; i++) {
                        for (let j = 0; j < 10; j++) {
                            while (condition) {
                                // Deep nesting
                            }
                        }
                    }
                }
            `);

            const analysis = await analyzer.analyzeCognitiveComplexity(mockDocument);
            assert.ok(analysis.score > 3);
        });

        test('analyzes conditional chains', async () => {
            const mockDocument = createMockDocument(`
                function conditionalChains(value) {
                    return value > 0 ? 'positive'
                         : value < 0 ? 'negative'
                         : value === 0 ? 'zero'
                         : 'unknown';
                }
            `);

            const analysis = await analyzer.analyzeCognitiveComplexity(mockDocument);
            assert.ok(analysis.score >= 3);
        });

        test('considers recursive complexity', async () => {
            const mockDocument = createMockDocument(`
                function recursiveFunction(n) {
                    if (n <= 1) return 1;
                    return n * recursiveFunction(n - 1);
                }
            `);

            const analysis = await analyzer.analyzeCognitiveComplexity(mockDocument);
            assert.ok(analysis.hasRecursion);
        });
    });

    suite('Dependency Analysis', () => {
        test('identifies module dependencies', async () => {
            const mockDocument = createMockDocument(`
                import { Service1 } from './service1';
                import { Service2 } from './service2';
                import * as utils from './utils';

                export class MyService {
                    constructor(
                        private service1: Service1,
                        private service2: Service2
                    ) {}
                }
            `);

            const analysis = await analyzer.analyzeDependencies(mockDocument);
            assert.strictEqual(analysis.dependencies.length, 3);
        });

        test('detects circular dependencies', async () => {
            const mockDocument = createMockDocument(`
                import { B } from './B';
                export class A {
                    constructor(private b: B) {}
                }
            `);

            sandbox.stub(analyzer as any, 'readFile').resolves(`
                import { A } from './A';
                export class B {
                    constructor(private a: A) {}
                }
            `);

            const analysis = await analyzer.analyzeDependencies(mockDocument);
            assert.ok(analysis.hasCircularDependencies);
        });
    });

    suite('Method Complexity', () => {
        test('analyzes class method complexity', async () => {
            const mockDocument = createMockDocument(`
                class ComplexClass {
                    method1() {
                        if (condition1) {
                            while (condition2) {
                                if (condition3) {
                                    // Complex nesting
                                }
                            }
                        }
                    }

                    method2() {
                        // Simple method
                        return true;
                    }
                }
            `);

            const analysis = await analyzer.analyzeMethodComplexity(mockDocument);
            assert.ok(analysis.methods.find(m => m.name === 'method1')?.complexity >
                     analysis.methods.find(m => m.name === 'method2')?.complexity);
        });

        test('identifies complex getters/setters', async () => {
            const mockDocument = createMockDocument(`
                class PropertyClass {
                    private _value: number;

                    get complexGetter() {
                        if (this._value < 0) return 0;
                        if (this._value > 100) return 100;
                        return this._value;
                    }

                    set complexSetter(value: number) {
                        if (value < 0) this._value = 0;
                        else if (value > 100) this._value = 100;
                        else this._value = value;
                    }
                }
            `);

            const analysis = await analyzer.analyzeMethodComplexity(mockDocument);
            assert.ok(analysis.methods.some(m => m.isAccessor && m.complexity > 1));
        });
    });

    suite('Code Path Analysis', () => {
        test('identifies unreachable code', async () => {
            const mockDocument = createMockDocument(`
                function hasUnreachableCode() {
                    return true;
                    console.log('never reached');
                }
            `);

            const analysis = await analyzer.analyzeCodePaths(mockDocument);
            assert.ok(analysis.hasUnreachableCode);
        });

        test('analyzes conditional paths', async () => {
            const mockDocument = createMockDocument(`
                function complexPaths(a: boolean, b: boolean) {
                    if (a) {
                        if (b) return 1;
                        return 2;
                    }
                    if (b) return 3;
                    return 4;
                }
            `);

            const analysis = await analyzer.analyzeCodePaths(mockDocument);
            assert.strictEqual(analysis.paths.length, 4);
        });
    });

    suite('Configuration', () => {
        test('respects complexity thresholds', async () => {
            analyzer.configure({
                maxCyclomaticComplexity: 2,
                maxCognitiveComplexity: 3
            });

            const mockDocument = createMockDocument(`
                function simpleButFlagged() {
                    if (a) {
                        if (b) return true;
                    }
                    return false;
                }
            `);

            const analysis = await analyzer.analyzeCyclomaticComplexity(mockDocument);
            assert.ok(analysis.functions[0].exceedsThreshold);
        });

        test('handles custom metrics', async () => {
            analyzer.configure({
                customMetrics: [{
                    name: 'ifCount',
                    pattern: /if\s*\(/g
                }]
            });

            const mockDocument = createMockDocument(`
                function countIfs() {
                    if (a) {}
                    if (b) {}
                    if (c) {}
                }
            `);

            const analysis = await analyzer.analyzeCustomMetrics(mockDocument);
            assert.strictEqual(analysis.metrics.ifCount, 3);
        });
    });

    suite('Error Handling', () => {
        test('handles syntax errors', async () => {
            const mockDocument = createMockDocument(`
                function invalidSyntax {
                    return
            `);

            const analysis = await analyzer.analyzeCyclomaticComplexity(mockDocument);
            assert.ok(analysis.error);
            assert.ok(analysis.error.includes('syntax'));
        });

        test('handles incomplete class definitions', async () => {
            const mockDocument = createMockDocument(`
                class Incomplete {
                    method1()
            `);

            const analysis = await analyzer.analyzeMethodComplexity(mockDocument);
            assert.ok(analysis.error);
        });
    });
});
