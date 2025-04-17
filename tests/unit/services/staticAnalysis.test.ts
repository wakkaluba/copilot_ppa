import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { strict as assert } from 'assert';
import { StaticAnalysisService } from '../../../src/services/staticAnalysis';
import { AnalysisRequest, AnalysisResult, StaticAnalysisTool } from '../../../src/services/types';
import { createMockDocument, createMockExtensionContext, createMockOutputChannel, createMockWorkspaceFolder } from '../../helpers/mockHelpers';

suite('StaticAnalysisService Tests', () => {
    let service: StaticAnalysisService;
    let sandbox: sinon.SinonSandbox;
    let outputChannel: vscode.OutputChannel;
    let context: vscode.ExtensionContext;
    let execSyncStub: sinon.SinonStub;

    setup(() => {
        sandbox = sinon.createSandbox();
        outputChannel = createMockOutputChannel();
        context = createMockExtensionContext();
        
        sandbox.stub(vscode.window, 'createOutputChannel').returns(outputChannel);
        sandbox.stub(vscode.workspace, 'getWorkspaceFolder').returns(createMockWorkspaceFolder());
        execSyncStub = sandbox.stub(require('child_process'), 'execSync');

        service = new StaticAnalysisService(context);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('initialize should set up analysis tools', async () => {
        await service.initialize();
        
        assert.ok(outputChannel.show.called);
        assert.ok(outputChannel.clear.called);
    });

    test('runAnalysis should execute ESLint analysis correctly', async () => {
        const request: AnalysisRequest = {
            tool: StaticAnalysisTool.ESLint,
            path: '/test/path',
            config: { extends: 'standard' }
        };

        execSyncStub.returns(Buffer.from(`
            /test/file.js: line 10, col 5, error - Expected '===' and instead saw '==' (eqeqeq)
            /test/file.js: line 15, col 3, warning - Unexpected console statement (no-console)
        `));

        const result = await service.runAnalysis(request);

        assert.ok(result.success);
        assert.ok(result.analysis);
        assert.strictEqual(result.analysis.issues.length, 2);
        assert.ok(result.analysis.issues.some(i => i.message.includes('eqeqeq')));
        assert.ok(result.analysis.issues.some(i => i.message.includes('no-console')));
    });

    test('runAnalysis should execute Prettier analysis correctly', async () => {
        const request: AnalysisRequest = {
            tool: StaticAnalysisTool.Prettier,
            path: '/test/path'
        };

        execSyncStub.returns(Buffer.from(`
            2 files would be reformatted:
            /test/file1.js
            /test/file2.js
        `));

        const result = await service.runAnalysis(request);

        assert.ok(result.success);
        assert.ok(result.analysis);
        assert.strictEqual(result.analysis.issueCount, 2);
    });

    test('runAnalysis should execute Stylelint analysis correctly', async () => {
        const request: AnalysisRequest = {
            tool: StaticAnalysisTool.Stylelint,
            path: '/test/path'
        };

        execSyncStub.returns(Buffer.from(`
            test.css
              10:5  ✖  Expected indentation of 2 spaces (indentation)
              15:3  ✖  Expected double quotes (string-quotes)
        `));

        const result = await service.runAnalysis(request);

        assert.ok(result.success);
        assert.ok(result.analysis);
        assert.strictEqual(result.analysis.issues.length, 2);
    });

    test('runAnalysis should execute SonarQube analysis correctly', async () => {
        const request: AnalysisRequest = {
            tool: StaticAnalysisTool.SonarQube,
            path: '/test/path'
        };

        execSyncStub.returns(Buffer.from(JSON.stringify({
            issues: [
                {
                    message: 'Remove unused variable',
                    component: '/test/file.js',
                    line: 10,
                    severity: 'MAJOR'
                },
                {
                    message: 'Add missing documentation',
                    component: '/test/file.js',
                    line: 15,
                    severity: 'MINOR'
                }
            ]
        })));

        const result = await service.runAnalysis(request);

        assert.ok(result.success);
        assert.ok(result.analysis);
        assert.strictEqual(result.analysis.issues.length, 2);
        assert.ok(result.analysis.issues.some(i => i.severity === 'MAJOR'));
        assert.ok(result.analysis.issues.some(i => i.severity === 'MINOR'));
    });

    test('runAnalysis should handle tool execution errors', async () => {
        const request: AnalysisRequest = {
            tool: StaticAnalysisTool.ESLint,
            path: '/test/path'
        };

        const error = new Error('Command failed');
        execSyncStub.throws(error);

        const result = await service.runAnalysis(request);

        assert.strictEqual(result.success, false);
        assert.ok(result.error);
        assert.strictEqual(result.error.message, error.message);
    });

    test('runAnalysis should handle invalid tool configuration', async () => {
        const request: AnalysisRequest = {
            tool: 'unknown' as StaticAnalysisTool,
            path: '/test/path'
        };

        const result = await service.runAnalysis(request);

        assert.strictEqual(result.success, false);
        assert.ok(result.message.includes('not supported'));
    });

    test('runAnalysis should handle empty output', async () => {
        const request: AnalysisRequest = {
            tool: StaticAnalysisTool.ESLint,
            path: '/test/path'
        };

        execSyncStub.returns(Buffer.from(''));

        const result = await service.runAnalysis(request);

        assert.ok(result.success);
        assert.ok(result.analysis);
        assert.strictEqual(result.analysis.issueCount, 0);
    });

    test('analyzeWorkspace should run analysis on all supported files', async () => {
        const workspaceFolder = createMockWorkspaceFolder();
        sandbox.stub(vscode.workspace, 'findFiles').resolves([
            vscode.Uri.file('/test/file1.js'),
            vscode.Uri.file('/test/file2.ts'),
            vscode.Uri.file('/test/style.css')
        ]);

        execSyncStub.returns(Buffer.from(''));

        const results = await service.analyzeWorkspace(workspaceFolder);

        assert.ok(Array.isArray(results));
        assert.ok(results.every(r => r.success));
        assert.strictEqual(results.length, 3);
    });

    test('getToolConfig should return appropriate config for each tool', () => {
        const eslintConfig = service.getToolConfig(StaticAnalysisTool.ESLint);
        const prettierConfig = service.getToolConfig(StaticAnalysisTool.Prettier);
        const stylelintConfig = service.getToolConfig(StaticAnalysisTool.Stylelint);

        assert.ok(eslintConfig.extends);
        assert.ok(prettierConfig.printWidth);
        assert.ok(stylelintConfig.rules);
    });
});