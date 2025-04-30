import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { CodeQualityService } from '../../../../src/services/codeQuality/codeQualityService';
import { createMockDocument, createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('CodeQualityService Tests', () => {
    let service: CodeQualityService;
    let context: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;
    let diagnosticCollection: vscode.DiagnosticCollection;

    setup(() => {
        sandbox = sinon.createSandbox();
        context = createMockExtensionContext();

        diagnosticCollection = {
            set: sandbox.stub(),
            delete: sandbox.stub(),
            clear: sandbox.stub(),
            dispose: sandbox.stub()
        } as any;

        sandbox.stub(vscode.languages, 'createDiagnosticCollection').returns(diagnosticCollection);
        service = new CodeQualityService(context);
    });

    teardown(() => {
        sandbox.restore();
        service.dispose();
    });

    suite('Service Initialization', () => {
        test('initializes diagnostic collection', () => {
            assert.ok(vscode.languages.createDiagnosticCollection.calledOnce);
            assert.ok(vscode.languages.createDiagnosticCollection.calledWith('code-quality'));
        });

        test('creates analyzers for supported languages', () => {
            assert.ok(service.hasAnalyzerFor('typescript'));
            assert.ok(service.hasAnalyzerFor('javascript'));
            assert.ok(service.hasAnalyzerFor('python'));
        });
    });

    suite('Document Analysis', () => {
        test('analyzes TypeScript code quality', async () => {
            const mockDocument = createMockDocument(`
                function poorlyWrittenFunction(x: any) {
                    var result; // Using var
                    if(x) { result = 1 }
                    else{ result = 2 }
                    return result
                }
            `, 'typescript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.length > 0);
            assert.ok(results.issues.some(i => i.type === 'style'));
        });

        test('analyzes JavaScript code quality', async () => {
            const mockDocument = createMockDocument(`
                function badFunction() {
                    for(var i=0;i<10;i++){
                        console.log(i)
                    }
                }
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'formatting'));
        });

        test('handles unsupported file types', async () => {
            const mockDocument = createMockDocument('Some content', 'plaintext');
            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.skipped);
            assert.ok(results.skipReason?.includes('unsupported'));
        });
    });

    suite('Diagnostic Integration', () => {
        test('converts analysis results to diagnostics', async () => {
            const mockDocument = createMockDocument(`
                const unusedVariable = 42;
                function* badGeneratorNaming() { yield 1; }
            `, 'typescript');

            await service.updateDiagnostics(mockDocument);

            assert.ok(diagnosticCollection.set.calledOnce);
            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.ok(diagnostics.length > 0);
            assert.ok(diagnostics.some(d => d.severity === vscode.DiagnosticSeverity.Warning));
        });

        test('clears diagnostics for closed documents', () => {
            const uri = vscode.Uri.file('test.ts');
            service.clearDiagnostics(uri);
            assert.ok(diagnosticCollection.delete.calledWith(uri));
        });
    });

    suite('Code Style Analysis', () => {
        test('identifies style inconsistencies', async () => {
            const mockDocument = createMockDocument(`
                class badClassName {
                    constructor() {
                        this.property=42;
                    }
                    BAD_METHOD_NAME() {
                        return this.property;
                    }
                }
            `, 'typescript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'naming'));
            assert.ok(results.issues.some(i => i.type === 'style'));
        });

        test('checks for proper indentation', async () => {
            const mockDocument = createMockDocument(`
function badlyIndented() {
    if (true) {
   console.log('wrong indent');
     }
}
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'indentation'));
        });
    });

    suite('Code Metrics', () => {
        test('calculates complexity metrics', async () => {
            const mockDocument = createMockDocument(`
                function complexFunction(a, b, c) {
                    if (a) {
                        if (b) {
                            if (c) {
                                return 1;
                            }
                        }
                    }
                    return 0;
                }
            `, 'typescript');

            const metrics = await service.calculateMetrics(mockDocument);
            assert.ok(metrics.cyclomaticComplexity > 1);
            assert.ok(metrics.maintainabilityIndex);
        });

        test('tracks quality trends', async () => {
            const mockDocument = createMockDocument(`
                function poorQualityCode() {
                    var x = 1;
                    var y = 2;
                    var z = x + y;
                    return z;
                }
            `, 'javascript');

            await service.updateQualityHistory(mockDocument);
            const trends = service.getQualityTrends(mockDocument.uri);
            assert.ok(trends.length > 0);
            assert.ok(trends[0].timestamp);
            assert.ok('score' in trends[0]);
        });
    });

    suite('Fix Suggestions', () => {
        test('generates fix suggestions', async () => {
            const mockDocument = createMockDocument(`
                var x = 1; // Should use const
                if(x==1){} // Missing spaces
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.suggestions.length > 0);
            assert.ok(results.suggestions.some(s => s.type === 'use-const'));
            assert.ok(results.suggestions.some(s => s.type === 'format-if'));
        });

        test('provides quick fixes', async () => {
            const mockDocument = createMockDocument(`
                function badFunction(a,b) {
                    return a+b
                }
            `, 'typescript');

            const fixes = await service.getQuickFixes(mockDocument, new vscode.Range(0, 0, 2, 0));
            assert.ok(fixes.length > 0);
            assert.ok(fixes.some(f => f.kind === vscode.CodeActionKind.QuickFix));
        });
    });

    suite('Configuration', () => {
        test('respects severity settings', async () => {
            service.configure({ treatStyleAsErrors: true });

            const mockDocument = createMockDocument(`
                function test() { return 42 } // Missing semicolon
            `, 'typescript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.severity === 'error' && i.type === 'style'));
        });

        test('handles rule customization', async () => {
            service.configure({
                rules: {
                    'max-line-length': 40,
                    'no-console': 'error'
                }
            });

            const mockDocument = createMockDocument(`
                console.log('This line is definitely longer than 40 characters');
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.issues.some(i => i.type === 'max-line-length'));
            assert.ok(results.issues.some(i => i.type === 'no-console' && i.severity === 'error'));
        });
    });

    suite('Error Handling', () => {
        test('handles parser errors gracefully', async () => {
            const mockDocument = createMockDocument(`
                const x = {; // Invalid syntax
            `, 'javascript');

            const results = await service.analyzeDocument(mockDocument);
            assert.ok(results.error);
            assert.ok(results.error.includes('parse'));
        });

        test('handles missing files', async () => {
            const uri = vscode.Uri.file('nonexistent.ts');
            await service.updateDiagnostics({ uri } as any);
            assert.ok(diagnosticCollection.delete.calledWith(uri));
        });
    });

    suite('Performance', () => {
        test('handles large files efficiently', async () => {
            // Create a large file
            const largeContent = Array(1000)
                .fill('function test() { return 42; }')
                .join('\n');
            const mockDocument = createMockDocument(largeContent, 'javascript');

            const startTime = Date.now();
            await service.analyzeDocument(mockDocument);
            const duration = Date.now() - startTime;

            assert.ok(duration < 5000); // Should complete in reasonable time
        });

        test('caches analysis results', async () => {
            const mockDocument = createMockDocument(`
                function test() { return 42; }
            `, 'typescript');

            // First analysis
            await service.analyzeDocument(mockDocument);
            const startTime = Date.now();

            // Second analysis of the same content
            await service.analyzeDocument(mockDocument);
            const duration = Date.now() - startTime;

            assert.ok(duration < 100); // Should be very fast due to caching
        });
    });
});
