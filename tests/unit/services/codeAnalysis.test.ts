import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { CodeAnalysisService } from '../../../src/services/codeAnalysis';
import { ComplexityAnalyzer } from '../../../src/codeTools/complexityAnalyzer';
import { BestPracticesChecker } from '../../../src/services/codeQuality/bestPracticesChecker';
import { CodeOptimizer } from '../../../src/services/codeQuality/codeOptimizer';
import { createMockDocument, createMockExtensionContext, createMockOutputChannel } from '../../helpers/mockHelpers';

suite('CodeAnalysisService Tests', () => {
    let service: CodeAnalysisService;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.OutputChannel;
    let context: vscode.ExtensionContext;
    let complexityAnalyzer: ComplexityAnalyzer;
    let bestPracticesChecker: BestPracticesChecker;
    let codeOptimizer: CodeOptimizer;

    setup(() => {
        sandbox = sinon.createSandbox();
        outputChannel = createMockOutputChannel();
        context = createMockExtensionContext();
        
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);

        // Create and stub the dependencies
        complexityAnalyzer = new ComplexityAnalyzer(context);
        bestPracticesChecker = new BestPracticesChecker(context);
        codeOptimizer = new CodeOptimizer(context);

        // Create service with dependencies
        service = new CodeAnalysisService(context, {
            complexityAnalyzer,
            bestPracticesChecker,
            codeOptimizer
        });
    });

    teardown(() => {
        sandbox.restore();
    });

    test('initialize should set up all analyzers', async () => {
        await service.initialize();
        
        assert.ok(outputChannel.show.called);
        assert.ok(outputChannel.clear.called);
    });

    test('analyzeCurrentFile should warn if no active editor', async () => {
        const showWarningStub = sandbox.stub(vscode.window, 'showWarningMessage');
        sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

        await service.analyzeCurrentFile();

        assert.ok(showWarningStub.calledWith('No active editor found'));
    });

    test('analyzeCode should run full analysis', async () => {
        const document = createMockDocument(`
            function complexFunction(x, y) {
                var result = 0;
                for (let i = 0; i < x; i++) {
                    for (let j = 0; j < y; j++) {
                        result += i * j;
                        console.log(result);
                    }
                }
                return result;
            }
        `);

        const analysis = await service.analyzeCode(document);

        assert.ok(analysis.complexity);
        assert.ok(analysis.bestPractices);
        assert.ok(analysis.optimization);
        assert.ok(analysis.complexity.cyclomaticComplexity > 1);
        assert.ok(analysis.bestPractices.some(issue => issue.type === 'convention'));
        assert.ok(analysis.optimization.suggestions.length > 0);
    });

    test('getComplexityMetrics should return metrics', async () => {
        const document = createMockDocument(`
            function test(condition) {
                if (condition) {
                    return true;
                } else {
                    return false;
                }
            }
        `);

        const metrics = await service.getComplexityMetrics(document);

        assert.ok(metrics.cyclomaticComplexity > 1);
        assert.ok(metrics.maintainabilityIndex >= 0);
        assert.ok(metrics.maintainabilityIndex <= 100);
    });

    test('getCodeIssues should return code quality issues', async () => {
        const document = createMockDocument(`
            function badFunction() {
                var x = 0;
                console.log(x);
                return x * 0.15;
            }
        `);

        const issues = await service.getCodeIssues(document);

        assert.ok(Array.isArray(issues));
        assert.ok(issues.some(i => i.type === 'convention'));
        assert.ok(issues.some(i => i.type === 'debugging'));
    });

    test('getOptimizationSuggestions should return suggestions', async () => {
        const document = createMockDocument(`
            function inefficientFunction(arr) {
                return arr.filter((item, index) => arr.indexOf(item) === index);
            }
        `);

        const suggestions = await service.getOptimizationSuggestions(document);

        assert.ok(Array.isArray(suggestions));
        assert.ok(suggestions.some(s => s.type === 'dataStructure'));
    });

    test('analyzeCodeQuality should provide comprehensive report', async () => {
        const document = createMockDocument(`
            class TestClass {
                constructor() {
                    var value = 0;
                    console.log('initialized');
                }
                
                getData(param) {
                    return param * 0.15;
                }
            }
        `);

        const report = await service.analyzeCodeQuality(document);
        
        assert.ok(report.complexity);
        assert.ok(report.bestPractices);
        assert.ok(report.suggestions);
        assert.ok(report.score >= 0);
        assert.ok(report.score <= 100);
    });

    test('analyzeDependencyGraph should analyze imports', async () => {
        const document = createMockDocument(`
            import { Service1 } from './service1';
            import { Service2 } from './service2';
            import { Utils } from '../utils';

            export class MyService {
                constructor(private service1: Service1, private service2: Service2) {}
                
                process() {
                    return Utils.combine(
                        this.service1.getData(),
                        this.service2.getData()
                    );
                }
            }
        `);

        const graph = await service.analyzeDependencyGraph(document);

        assert.ok(graph.nodes.length === 4); // MyService + 3 imports
        assert.ok(graph.edges.length === 3); // 3 dependencies
        assert.ok(graph.circular === false);
    });

    test('analyzeMaintainability should rate code maintainability', async () => {
        const document = createMockDocument(`
            class Calculator {
                add(a: number, b: number) { return a + b; }
                subtract(a: number, b: number) { return a - b; }
                multiply(a: number, b: number) { return a * b; }
                divide(a: number, b: number) { 
                    if (b === 0) throw new Error('Division by zero');
                    return a / b;
                }
            }
        `);

        const result = await service.analyzeMaintainability(document);

        assert.ok(result.maintainabilityIndex >= 0);
        assert.ok(result.maintainabilityIndex <= 100);
        assert.ok(result.comments.length > 0);
    });

    test('getRefactoringPlan should suggest improvements', async () => {
        const document = createMockDocument(`
            function processData(items) {
                var results = [];
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    if (item.value > 0) {
                        results.push({
                            id: item.id,
                            processed: item.value * 0.15,
                            timestamp: new Date()
                        });
                    }
                }
                return results;
            }
        `);

        const plan = await service.getRefactoringPlan(document);

        assert.ok(plan.suggestions.length > 0);
        assert.ok(plan.priority.length > 0);
        assert.ok(plan.estimatedImpact >= 0);
        assert.ok(plan.estimatedImpact <= 1);
    });
});