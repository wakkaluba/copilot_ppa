import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { ComplexityAnalyzer } from '../../../src/codeTools/complexityAnalyzer';
import { createMockExtensionContext, createMockOutputChannel, createMockWorkspaceFolder } from '../../helpers/mockHelpers';

suite('ComplexityAnalyzer Tests', () => {
    let analyzer: ComplexityAnalyzer;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.OutputChannel;
    let context: vscode.ExtensionContext;

    setup(() => {
        sandbox = sinon.createSandbox();
        outputChannel = createMockOutputChannel();
        context = createMockExtensionContext();
        
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        sandbox.stub(vscode.workspace, 'getWorkspaceFolder').returns(createMockWorkspaceFolder());

        analyzer = new ComplexityAnalyzer(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('initialize should create output channel', async () => {
        await analyzer.initialize();
        
        assert.ok(outputChannel.show.called);
        assert.ok(outputChannel.clear.called);
    });

    test('analyzeFile should warn if no active editor', async () => {
        const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');
        sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

        await analyzer.analyzeFile();

        assert.ok(showWarningStub.calledWith('No active editor found'));
    });

    test('analyzeCyclomaticComplexity should calculate correctly for simple function', () => {
        const code = `
            function simple() {
                return true;
            }
        `;

        const complexity = analyzer.calculateCyclomaticComplexity(code);
        assert.strictEqual(complexity, 1);
    });

    test('analyzeCyclomaticComplexity should handle if statements', () => {
        const code = `
            function withIf(value) {
                if (value > 0) {
                    return 'positive';
                } else if (value < 0) {
                    return 'negative';
                } else {
                    return 'zero';
                }
            }
        `;

        const complexity = analyzer.calculateCyclomaticComplexity(code);
        assert.strictEqual(complexity, 3);
    });

    test('analyzeCyclomaticComplexity should handle loops', () => {
        const code = `
            function withLoops(arr) {
                for (let i = 0; i < arr.length; i++) {
                    while (arr[i] > 0) {
                        arr[i]--;
                    }
                }
            }
        `;

        const complexity = analyzer.calculateCyclomaticComplexity(code);
        assert.strictEqual(complexity, 3);
    });

    test('analyzeNesting should calculate maximum nesting level', () => {
        const code = `
            function deeplyNested(condition1, condition2) {
                if (condition1) {
                    for (let i = 0; i < 10; i++) {
                        if (condition2) {
                            while (true) {
                                break;
                            }
                        }
                    }
                }
            }
        `;

        const depth = analyzer.calculateNestingDepth(code);
        assert.strictEqual(depth, 4);
    });

    test('analyzeFunction should identify complex methods', () => {
        const code = `
            class Example {
                complexMethod(x, y) {
                    if (x > 0) {
                        while (y > 0) {
                            if (x === y) {
                                return true;
                            }
                            y--;
                        }
                    }
                    return false;
                }

                simpleMethod() {
                    return 'simple';
                }
            }
        `;

        const analysis = analyzer.analyzeFunction(code, 'complexMethod');
        assert.ok(analysis.complexity > 3);
        assert.strictEqual(analysis.name, 'complexMethod');
    });

    test('analyzeMetrics should combine different metrics', () => {
        const code = `
            function combined(value) {
                let result = 0;
                if (value > 0) {
                    for (let i = 0; i < value; i++) {
                        result += i;
                        if (i % 2 === 0) {
                            while (result > 100) {
                                result -= 10;
                            }
                        }
                    }
                }
                return result;
            }
        `;

        const metrics = analyzer.analyzeMetrics(code);
        
        assert.ok(metrics.cyclomaticComplexity > 4);
        assert.ok(metrics.nestingDepth > 3);
        assert.ok(metrics.maintainabilityIndex > 0);
        assert.ok(metrics.maintainabilityIndex <= 100);
    });

    test('calculateMaintainabilityIndex should provide valid score', () => {
        const code = `
            class Calculator {
                add(a, b) { return a + b; }
                subtract(a, b) { return a - b; }
                multiply(a, b) { return a * b; }
                divide(a, b) { 
                    if (b === 0) throw new Error('Division by zero');
                    return a / b;
                }
            }
        `;

        const maintainability = analyzer.calculateMaintainabilityIndex(code);
        assert.ok(maintainability > 0);
        assert.ok(maintainability <= 100);
    });

    test('getComplexityGrade should return correct grade', () => {
        const scores = [
            { complexity: 1, expected: 'A' },
            { complexity: 5, expected: 'A' },
            { complexity: 10, expected: 'B' },
            { complexity: 20, expected: 'C' },
            { complexity: 30, expected: 'D' },
            { complexity: 40, expected: 'E' }
        ];

        for (const { complexity, expected } of scores) {
            assert.strictEqual(analyzer.getComplexityGrade(complexity), expected);
        }
    });
});