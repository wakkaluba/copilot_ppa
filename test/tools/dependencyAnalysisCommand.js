/**
 * Tests for dependencyAnalysisCommand
 * Source: src\tools\dependencyAnalysisCommand.js
 */
const assert = require('assert');
const path = require('path');
const vscode = require('vscode');
const sinon = require('sinon');
const { DependencyAnalysisCommand } = require('../../src/tools/dependencyAnalysisCommand');
const { DependencyAnalysisService } = require('../../src/services/dependencyAnalysis/DependencyAnalysisService');
const { DependencyGraphProvider } = require('../../src/webview/dependencyGraphView');
const { LoggerService } = require('../../src/services/LoggerService');

describe('DependencyAnalysisCommand', () => {
    let command;
    let context;
    let sandbox;
    let mockService;
    let mockGraphProvider;
    let mockLogger;
    let commandRegisterStub;
    let windowShowErrorMessageStub;
    let windowShowWarningMessageStub;
    let windowWithProgressStub;
    let workspaceFoldersStub;
    let workspaceOnDidChangeWorkspaceFoldersStub;
    let workspaceOnDidChangeTextDocumentStub;
    let activeTextEditorStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the extension context
        context = {
            subscriptions: [],
            extensionPath: '/test/extension/path'
        };

        // Mock the DependencyAnalysisService
        mockService = {
            analyzeDependencies: sandbox.stub().resolves(),
            analyzeFileDependencies: sandbox.stub().resolves(),
            reset: sandbox.stub().resolves(),
            invalidateCache: sandbox.stub().resolves(),
            dispose: sandbox.stub()
        };

        // Mock the DependencyGraphProvider
        mockGraphProvider = {
            show: sandbox.stub().resolves()
        };

        // Mock the LoggerService
        mockLogger = {
            info: sandbox.stub(),
            error: sandbox.stub(),
            warn: sandbox.stub(),
            debug: sandbox.stub()
        };

        // Stub VS Code API
        commandRegisterStub = sandbox.stub(vscode.commands, 'registerCommand').returns({
            dispose: sandbox.stub()
        });

        windowShowErrorMessageStub = sandbox.stub(vscode.window, 'showErrorMessage');
        windowShowWarningMessageStub = sandbox.stub(vscode.window, 'showWarningMessage');
        windowWithProgressStub = sandbox.stub(vscode.window, 'withProgress').resolves();

        workspaceFoldersStub = sandbox.stub(vscode.workspace, 'workspaceFolders');
        workspaceOnDidChangeWorkspaceFoldersStub = sandbox.stub(vscode.workspace, 'onDidChangeWorkspaceFolders').returns({
            dispose: sandbox.stub()
        });
        workspaceOnDidChangeTextDocumentStub = sandbox.stub(vscode.workspace, 'onDidChangeTextDocument').returns({
            dispose: sandbox.stub()
        });

        activeTextEditorStub = sandbox.stub(vscode.window, 'activeTextEditor');

        // Stub constructor dependencies
        sandbox.stub(DependencyAnalysisService, 'constructor').returns(mockService);
        sandbox.stub(DependencyGraphProvider, 'constructor').returns(mockGraphProvider);
        sandbox.stub(LoggerService, 'getInstance').returns(mockLogger);

        // Create a fresh instance for each test
        command = new DependencyAnalysisCommand(context);

        // Replace instance dependencies with mocks
        command.service = mockService;
        command.graphProvider = mockGraphProvider;
        command.logger = mockLogger;
    });

    afterEach(() => {
        // Restore all stubbed methods
        sandbox.restore();
    });

    describe('register', () => {
        it('should register commands correctly', () => {
            // Act
            const disposable = command.register();

            // Assert
            assert.strictEqual(commandRegisterStub.callCount, 3);
            assert.strictEqual(commandRegisterStub.getCall(0).args[0], 'vscodeLocalLLMAgent.analyzeDependencies');
            assert.strictEqual(commandRegisterStub.getCall(1).args[0], 'vscodeLocalLLMAgent.analyzeFileDependencies');
            assert.strictEqual(commandRegisterStub.getCall(2).args[0], 'vscodeLocalLLMAgent.showDependencyGraph');
            assert.ok(disposable.dispose);
        });

        it('should handle registration errors', () => {
            // Arrange
            commandRegisterStub.throws(new Error('Registration failed'));

            // Act & Assert
            assert.throws(() => {
                command.register();
            }, /Registration failed/);
            assert.strictEqual(mockLogger.error.callCount, 1);
        });

        it('should cleanup disposables on dispose', () => {
            // Arrange
            const mockDisposable = { dispose: sandbox.stub() };
            command.disposables = [mockDisposable, mockDisposable];

            // Act
            const disposable = command.register();
            disposable.dispose();

            // Assert
            assert.strictEqual(mockDisposable.dispose.callCount, 2);
            assert.strictEqual(command.disposables.length, 0);
            assert.strictEqual(mockService.dispose.callCount, 1);
        });
    });

    describe('handleAnalyzeDependencies', () => {
        it('should analyze dependencies when workspace is available', async () => {
            // Arrange
            const testPath = '/test/workspace';
            workspaceFoldersStub.value([{ uri: { fsPath: testPath } }]);
            windowWithProgressStub.callsFake(async (options, callback) => {
                await callback({ report: sandbox.stub() });
            });

            // Act
            await command.handleAnalyzeDependencies();

            // Assert
            assert.strictEqual(mockService.analyzeDependencies.callCount, 1);
            assert.strictEqual(mockService.analyzeDependencies.firstCall.args[0], testPath);
            assert.ok(mockService.analyzeDependencies.firstCall.args[1].onProgress);
        });

        it('should not analyze dependencies when workspace is not available', async () => {
            // Arrange
            workspaceFoldersStub.value([]);

            // Act
            await command.handleAnalyzeDependencies();

            // Assert
            assert.strictEqual(mockService.analyzeDependencies.callCount, 0);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });

        it('should handle errors during analysis', async () => {
            // Arrange
            const testPath = '/test/workspace';
            workspaceFoldersStub.value([{ uri: { fsPath: testPath } }]);
            windowWithProgressStub.rejects(new Error('Analysis failed'));

            // Act
            await command.handleAnalyzeDependencies();

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });
    });

    describe('handleAnalyzeFileDependencies', () => {
        it('should analyze file dependencies when a file is open', async () => {
            // Arrange
            const mockDocument = {
                uri: { fsPath: '/test/file.js' }
            };
            activeTextEditorStub.value({
                document: mockDocument
            });

            // Act
            await command.handleAnalyzeFileDependencies();

            // Assert
            assert.strictEqual(mockService.analyzeFileDependencies.callCount, 1);
            assert.deepStrictEqual(mockService.analyzeFileDependencies.firstCall.args[0], mockDocument.uri);
        });

        it('should show warning when no file is open', async () => {
            // Arrange
            activeTextEditorStub.value(null);

            // Act
            await command.handleAnalyzeFileDependencies();

            // Assert
            assert.strictEqual(mockService.analyzeFileDependencies.callCount, 0);
            assert.strictEqual(windowShowWarningMessageStub.callCount, 1);
        });

        it('should handle errors during file analysis', async () => {
            // Arrange
            const mockDocument = {
                uri: { fsPath: '/test/file.js' }
            };
            activeTextEditorStub.value({
                document: mockDocument
            });
            mockService.analyzeFileDependencies.rejects(new Error('File analysis failed'));

            // Act
            await command.handleAnalyzeFileDependencies();

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });
    });

    describe('handleShowDependencyGraph', () => {
        it('should show dependency graph when workspace is available', async () => {
            // Arrange
            const testPath = '/test/workspace';
            workspaceFoldersStub.value([{ uri: { fsPath: testPath } }]);

            // Act
            await command.handleShowDependencyGraph();

            // Assert
            assert.strictEqual(mockGraphProvider.show.callCount, 1);
            assert.strictEqual(mockGraphProvider.show.firstCall.args[0], testPath);
        });

        it('should not show dependency graph when workspace is not available', async () => {
            // Arrange
            workspaceFoldersStub.value([]);

            // Act
            await command.handleShowDependencyGraph();

            // Assert
            assert.strictEqual(mockGraphProvider.show.callCount, 0);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });

        it('should handle errors when showing graph', async () => {
            // Arrange
            const testPath = '/test/workspace';
            workspaceFoldersStub.value([{ uri: { fsPath: testPath } }]);
            mockGraphProvider.show.rejects(new Error('Graph display failed'));

            // Act
            await command.handleShowDependencyGraph();

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });
    });

    describe('event handlers', () => {
        it('should handle workspace change event', async () => {
            // Arrange
            const changeCallback = workspaceOnDidChangeWorkspaceFoldersStub.firstCall.args[0];

            // Act
            await changeCallback();

            // Assert
            assert.strictEqual(mockService.reset.callCount, 1);
        });

        it('should handle document change event for analyzable files', async () => {
            // Arrange
            const mockDocument = {
                fileName: 'test.js',
                uri: { fsPath: '/test/test.js' }
            };
            const changeCallback = workspaceOnDidChangeTextDocumentStub.firstCall.args[0];

            // Act
            await changeCallback({ document: mockDocument });

            // Assert
            assert.strictEqual(mockService.invalidateCache.callCount, 1);
            assert.deepStrictEqual(mockService.invalidateCache.firstCall.args[0], mockDocument.uri);
        });

        it('should ignore document change event for non-analyzable files', async () => {
            // Arrange
            const mockDocument = {
                fileName: 'test.txt',
                uri: { fsPath: '/test/test.txt' }
            };
            const changeCallback = workspaceOnDidChangeTextDocumentStub.firstCall.args[0];

            // Act
            await changeCallback({ document: mockDocument });

            // Assert
            assert.strictEqual(mockService.invalidateCache.callCount, 0);
        });

        it('should handle errors during workspace change', async () => {
            // Arrange
            mockService.reset.rejects(new Error('Reset failed'));
            const changeCallback = workspaceOnDidChangeWorkspaceFoldersStub.firstCall.args[0];

            // Act
            await changeCallback();

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });

        it('should handle errors during document change', async () => {
            // Arrange
            const mockDocument = {
                fileName: 'test.js',
                uri: { fsPath: '/test/test.js' }
            };
            mockService.invalidateCache.rejects(new Error('Cache invalidation failed'));
            const changeCallback = workspaceOnDidChangeTextDocumentStub.firstCall.args[0];

            // Act
            await changeCallback({ document: mockDocument });

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
        });
    });

    describe('utility methods', () => {
        it('should identify analyzable file types correctly', () => {
            // Arrange and Act
            const jsResult = command.shouldAnalyze({ fileName: 'test.js' });
            const tsResult = command.shouldAnalyze({ fileName: 'test.ts' });
            const jsxResult = command.shouldAnalyze({ fileName: 'test.jsx' });
            const tsxResult = command.shouldAnalyze({ fileName: 'test.tsx' });
            const jsonResult = command.shouldAnalyze({ fileName: 'test.json' });
            const vueResult = command.shouldAnalyze({ fileName: 'test.vue' });
            const txtResult = command.shouldAnalyze({ fileName: 'test.txt' });

            // Assert
            assert.strictEqual(jsResult, true);
            assert.strictEqual(tsResult, true);
            assert.strictEqual(jsxResult, true);
            assert.strictEqual(tsxResult, true);
            assert.strictEqual(jsonResult, true);
            assert.strictEqual(vueResult, true);
            assert.strictEqual(txtResult, false);
        });

        it('should handle errors properly', () => {
            // Arrange
            const errorMsg = 'Test error message';
            const error = new Error(errorMsg);

            // Act
            command.handleError('Test error', error);

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
            assert.ok(windowShowErrorMessageStub.firstCall.args[0].includes('Test error'));
            assert.ok(windowShowErrorMessageStub.firstCall.args[0].includes(errorMsg));
        });

        it('should handle non-Error objects in error handler', () => {
            // Arrange
            const errorObj = { custom: 'error' };

            // Act
            command.handleError('Test error', errorObj);

            // Assert
            assert.strictEqual(mockLogger.error.callCount, 1);
            assert.strictEqual(windowShowErrorMessageStub.callCount, 1);
            assert.ok(windowShowErrorMessageStub.firstCall.args[0].includes('Test error'));
            assert.ok(windowShowErrorMessageStub.firstCall.args[0].includes('[object Object]'));
        });
    });
});
