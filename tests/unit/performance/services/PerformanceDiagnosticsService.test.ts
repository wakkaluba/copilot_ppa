import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { PerformanceDiagnosticsService } from '../../../../src/performance/services/PerformanceDiagnosticsService';
import { createMockExtensionContext } from '../../../helpers/mockHelpers';

suite('PerformanceDiagnosticsService Tests', () => {
    let service: PerformanceDiagnosticsService;
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
        service = new PerformanceDiagnosticsService(context);
    });

    teardown(() => {
        sandbox.restore();
        service.dispose();
    });

    suite('Diagnostic Management', () => {
        test('initializes diagnostic collection', () => {
            assert.ok(vscode.languages.createDiagnosticCollection.calledOnce);
            assert.ok(vscode.languages.createDiagnosticCollection.calledWith('performance'));
        });

        test('clears diagnostics on reset', () => {
            service.reset();
            assert.ok(diagnosticCollection.clear.calledOnce);
        });

        test('disposes diagnostic collection properly', () => {
            service.dispose();
            assert.ok(diagnosticCollection.dispose.calledOnce);
        });
    });

    suite('Performance Issue Reporting', () => {
        test('reports performance issues as diagnostics', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [{
                message: 'Performance issue detected',
                line: 1,
                severity: 'warning',
                type: 'performance'
            }];

            service.updateDiagnostics(uri, issues);

            assert.ok(diagnosticCollection.set.calledOnce);
            const [setUri, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(setUri.fsPath, uri.fsPath);
            assert.ok(diagnostics.length > 0);
            assert.strictEqual(diagnostics[0].message, 'Performance issue detected');
        });

        test('maps severity levels correctly', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [
                { message: 'Critical issue', line: 1, severity: 'error', type: 'performance' },
                { message: 'Warning issue', line: 2, severity: 'warning', type: 'performance' },
                { message: 'Info issue', line: 3, severity: 'info', type: 'performance' }
            ];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(diagnostics[0].severity, vscode.DiagnosticSeverity.Error);
            assert.strictEqual(diagnostics[1].severity, vscode.DiagnosticSeverity.Warning);
            assert.strictEqual(diagnostics[2].severity, vscode.DiagnosticSeverity.Information);
        });

        test('handles multiple files', () => {
            const uri1 = vscode.Uri.file('test1.ts');
            const uri2 = vscode.Uri.file('test2.ts');
            const issues1 = [{ message: 'Issue 1', line: 1, severity: 'warning', type: 'performance' }];
            const issues2 = [{ message: 'Issue 2', line: 1, severity: 'warning', type: 'performance' }];

            service.updateDiagnostics(uri1, issues1);
            service.updateDiagnostics(uri2, issues2);

            assert.strictEqual(diagnosticCollection.set.callCount, 2);
        });
    });

    suite('Issue Filtering', () => {
        test('filters out non-performance issues', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [
                { message: 'Performance issue', line: 1, severity: 'warning', type: 'performance' },
                { message: 'Other issue', line: 2, severity: 'warning', type: 'other' }
            ];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(diagnostics.length, 1);
            assert.ok(diagnostics[0].message.includes('Performance issue'));
        });

        test('handles empty issue list', () => {
            const uri = vscode.Uri.file('test.ts');
            service.updateDiagnostics(uri, []);
            assert.ok(diagnosticCollection.delete.calledWith(uri));
        });
    });

    suite('Diagnostic Customization', () => {
        test('includes source information', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [{
                message: 'Test issue',
                line: 1,
                severity: 'warning',
                type: 'performance'
            }];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(diagnostics[0].source, 'Performance Analyzer');
        });

        test('includes code property', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [{
                message: 'Test issue',
                line: 1,
                severity: 'warning',
                type: 'performance',
                code: 'PERF001'
            }];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(diagnostics[0].code, 'PERF001');
        });

        test('sets diagnostic range correctly', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [{
                message: 'Test issue',
                line: 1,
                column: 5,
                endLine: 1,
                endColumn: 10,
                severity: 'warning',
                type: 'performance'
            }];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(diagnostics[0].range.start.line, 1);
            assert.strictEqual(diagnostics[0].range.start.character, 5);
            assert.strictEqual(diagnostics[0].range.end.line, 1);
            assert.strictEqual(diagnostics[0].range.end.character, 10);
        });
    });

    suite('Error Handling', () => {
        test('handles invalid line numbers gracefully', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [{
                message: 'Test issue',
                line: -1,
                severity: 'warning',
                type: 'performance'
            }];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.strictEqual(diagnostics[0].range.start.line, 0);
        });

        test('handles missing properties gracefully', () => {
            const uri = vscode.Uri.file('test.ts');
            const issues = [{ message: 'Test issue' } as any];

            service.updateDiagnostics(uri, issues);

            const [, diagnostics] = diagnosticCollection.set.firstCall.args;
            assert.ok(diagnostics[0].message);
            assert.ok(diagnostics[0].range);
            assert.ok(diagnostics[0].severity);
        });
    });
});
