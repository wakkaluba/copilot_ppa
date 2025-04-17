import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { StaticAnalysisService } from '../../../../src/services/testRunner/staticAnalysisService';
import { TestResult } from '../../../../src/services/testRunner/types';

suite('StaticAnalysisService Tests', () => {
    let service: StaticAnalysisService;
    let sandbox: sinon.SinonSandbox;
    let execSyncStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        execSyncStub = sandbox.stub(require('child_process'), 'execSync');
        service = new StaticAnalysisService();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('processAnalysisResult should handle ESLint output', () => {
        const result: TestResult = {
            success: true,
            stdout: `
                /test/file.js: line 10, col 5, error - Expected '===' and instead saw '==' (eqeqeq)
                /test/file.js: line 15, col 3, warning - Unexpected console statement (no-console)
            `,
            stderr: ''
        };

        const processed = (service as any).processAnalysisResult('eslint', result);

        assert.ok(processed.staticAnalysis);
        assert.ok(processed.staticAnalysis.issues);
        assert.strictEqual(processed.staticAnalysis.issues.length, 2);
        assert.ok(processed.staticAnalysis.issues.some(i => i.message.includes('eqeqeq')));
        assert.ok(processed.staticAnalysis.issues.some(i => i.message.includes('no-console')));
    });

    test('processAnalysisResult should handle Prettier output', () => {
        const result: TestResult = {
            success: true,
            stdout: `
                2 files would be reformatted.
                /test/file1.js
                /test/file2.js
            `,
            stderr: ''
        };

        const processed = (service as any).processAnalysisResult('prettier', result);

        assert.ok(processed.staticAnalysis);
        assert.strictEqual(processed.staticAnalysis.issueCount, 2);
        assert.strictEqual(processed.message, 'Found 2 issues that need to be fixed');
    });

    test('processAnalysisResult should handle Stylelint output', () => {
        const result: TestResult = {
            success: true,
            stdout: `
                /test/style.css
                  10:5  ✖  Expected indentation of 2 spaces (indentation)
                  15:3  ✖  Expected double quotes (string-quotes)
            `,
            stderr: ''
        };

        const processed = (service as any).processAnalysisResult('stylelint', result);

        assert.ok(processed.staticAnalysis);
        assert.strictEqual(processed.staticAnalysis.issueCount, 2);
        assert.ok(processed.message.includes('2 issues'));
    });

    test('processAnalysisResult should handle SonarQube output', () => {
        const result: TestResult = {
            success: true,
            stdout: JSON.stringify({
                issues: [
                    {
                        message: 'Remove this unused variable',
                        component: '/test/file.js',
                        line: 10,
                        severity: 'MAJOR'
                    },
                    {
                        message: 'Add a nested comment explaining why this function is empty',
                        component: '/test/file.js',
                        line: 15,
                        severity: 'MINOR'
                    }
                ]
            }),
            stderr: ''
        };

        const processed = (service as any).processAnalysisResult('sonarqube', result);

        assert.ok(processed.staticAnalysis);
        assert.strictEqual(processed.staticAnalysis.issues.length, 2);
        assert.ok(processed.staticAnalysis.issues.some(i => i.severity === 'MAJOR'));
        assert.ok(processed.staticAnalysis.issues.some(i => i.severity === 'MINOR'));
    });

    test('runAnalysis should execute correct tool command', async () => {
        execSyncStub.returns('No issues found');

        await service.runAnalysis({
            tool: 'eslint',
            path: '/test/path',
            config: { extends: 'standard' }
        });

        assert.ok(execSyncStub.calledOnce);
        assert.ok(execSyncStub.firstCall.args[0].includes('eslint'));
    });

    test('runAnalysis should handle tool execution errors', async () => {
        const error = new Error('Command failed');
        execSyncStub.throws(error);

        const result = await service.runAnalysis({
            tool: 'eslint',
            path: '/test/path'
        });

        assert.strictEqual(result.success, false);
        assert.ok(result.error);
        assert.strictEqual(result.error.message, error.message);
    });

    test('runAnalysis should handle missing tool configuration', async () => {
        const result = await service.runAnalysis({
            tool: 'unknown-tool',
            path: '/test/path'
        });

        assert.strictEqual(result.success, false);
        assert.ok(result.message.includes('not supported'));
    });
});