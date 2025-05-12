const vscode = require('vscode');
const { ComplexityAnalysisCommand } = require('../complexityAnalysisCommand');
const { CodeComplexityAnalyzer } = require('../codeComplexityAnalyzer');
const sinon = require('sinon');
const path = require('path');

describe('ComplexityAnalysisCommand', () => {
    let command;
    let analyzerStub;
    let sandbox;
    let mockShowErrorMessage;
    let mockShowInfoMessage;
    let registerCommandStub;
    let showTextDocumentStub;
    let mockDisposable;
    let mockEditor;
    let mockDisposableFrom;
    let mockProgress;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create stub for CodeComplexityAnalyzer
        analyzerStub = sandbox.createStubInstance(CodeComplexityAnalyzer);

        // Mock vscode APIs
        mockShowErrorMessage = sandbox.stub(vscode.window, 'showErrorMessage');
        mockShowInfoMessage = sandbox.stub(vscode.window, 'showInformationMessage');
        registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand').returns({ dispose: sandbox.stub() });
        showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument');
        mockDisposable = { dispose: sandbox.stub() };
        mockDisposableFrom = sandbox.stub(vscode.Disposable, 'from').returns(mockDisposable);
        mockProgress = sandbox.stub(vscode.window, 'withProgress').callsFake((options, task) => task());

        // Create mock editor
        mockEditor = {
            document: {
                uri: { fsPath: '/test/file.js' },
                fileName: 'file.js',
                languageId: 'javascript',
                getText: sandbox.stub().returns('function test() { }')
            },
            setDecorations: sandbox.stub()
        };
        vscode.window.activeTextEditor = mockEditor;

        // Create the command with the stubbed analyzer
        command = new ComplexityAnalysisCommand();
        command.complexityAnalyzer = analyzerStub;
    });

    afterEach(() => {
        sandbox.restore();
        vscode.window.activeTextEditor = undefined;
    });

    describe('register', () => {
        it('should register all complexity analysis commands', () => {
            // Execute
            command.register();

            // Verify
            expect(registerCommandStub.calledThrice).toBe(true);
            expect(registerCommandStub.getCall(0).args[0]).toBe('copilot-ppa.analyzeFileComplexity');
            expect(registerCommandStub.getCall(1).args[0]).toBe('copilot-ppa.analyzeWorkspaceComplexity');
            expect(registerCommandStub.getCall(2).args[0]).toBe('copilot-ppa.toggleComplexityVisualization');
        });

        it('should return a disposable that cleans up all commands', () => {
            // Setup
            const disposable = command.register();

            // Verify
            expect(mockDisposableFrom.called).toBe(true);
            expect(disposable).toBe(mockDisposable);
        });
    });

    describe('analyzeCurrentFile', () => {
        it('should show warning when no active editor', async () => {
            // Setup
            vscode.window.activeTextEditor = undefined;

            // Execute
            await command.analyzeCurrentFile();

            // Verify
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockShowErrorMessage.firstCall.args[0]).toContain('No active');
        });

        it('should analyze active file and show report', async () => {
            // Setup
            const mockResult = {
                filePath: '/test/file.js',
                averageComplexity: 3.5,
                functions: [
                    { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
                ]
            };
            analyzerStub.analyzeFile.resolves(mockResult);

            // Execute
            await command.analyzeCurrentFile();

            // Verify
            expect(analyzerStub.analyzeFile.calledOnce).toBe(true);
            expect(analyzerStub.analyzeFile.firstCall.args[0]).toBe(mockEditor.document.uri.fsPath);
            expect(mockShowInfoMessage.calledOnce).toBe(true);
        });

        it('should handle unsupported file types', async () => {
            // Setup
            mockEditor.document.languageId = 'markdown';

            // Execute
            await command.analyzeCurrentFile();

            // Verify
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockShowErrorMessage.firstCall.args[0]).toContain('Unsupported file type');
        });
    });

    describe('analyzeWorkspace', () => {
        it('should show warning when no workspace folders', async () => {
            // Setup
            vscode.workspace.workspaceFolders = undefined;

            // Execute
            await command.analyzeWorkspace();

            // Verify
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockShowErrorMessage.firstCall.args[0]).toContain('No workspace folder');
        });

        it('should analyze single workspace folder directly', async () => {
            // Setup
            vscode.workspace.workspaceFolders = [{ uri: { fsPath: '/test/workspace' } }];
            const mockResults = [
                { filePath: '/test/file1.js', averageComplexity: 2.5 },
                { filePath: '/test/file2.js', averageComplexity: 4.5 }
            ];
            analyzerStub.analyzeWorkspace.resolves(mockResults);

            // Execute
            await command.analyzeWorkspace();

            // Verify
            expect(analyzerStub.analyzeWorkspace.calledOnce).toBe(true);
            expect(analyzerStub.analyzeWorkspace.firstCall.args[0]).toBe('/test/workspace');
            expect(mockShowInfoMessage.calledOnce).toBe(true);
        });

        it('should handle empty analysis results', async () => {
            // Setup
            vscode.workspace.workspaceFolders = [{ uri: { fsPath: '/test/workspace' } }];
            analyzerStub.analyzeWorkspace.resolves([]);

            // Execute
            await command.analyzeWorkspace();

            // Verify
            expect(mockShowInfoMessage.calledOnce).toBe(true);
            expect(mockShowInfoMessage.firstCall.args[0]).toContain('No complexity data');
        });
    });

    describe('toggleComplexityVisualization', () => {
        it('should show warning when no active editor', async () => {
            // Setup
            vscode.window.activeTextEditor = undefined;

            // Execute
            await command.toggleComplexityVisualization();

            // Verify
            expect(mockShowErrorMessage.calledOnce).toBe(true);
            expect(mockShowErrorMessage.firstCall.args[0]).toContain('No active editor');
        });

        it('should disable existing decorations', async () => {
            // Setup
            const mockDisposable1 = { dispose: sandbox.stub() };
            const mockDisposable2 = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable1, mockDisposable2];

            // Execute
            await command.toggleComplexityVisualization();

            // Verify
            expect(mockDisposable1.dispose.calledOnce).toBe(true);
            expect(mockDisposable2.dispose.calledOnce).toBe(true);
            expect(command.decorationDisposables.length).toBe(0);
            expect(mockShowInfoMessage.calledOnce).toBe(true);
            expect(mockShowInfoMessage.firstCall.args[0]).toContain('Complexity visualization disabled');
        });

        it('should enable decorations for supported file', async () => {
            // Setup
            const mockResult = {
                functions: [
                    { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
                ]
            };
            analyzerStub.analyzeFile.resolves(mockResult);
            vscode.window.createTextEditorDecorationType = sandbox.stub().returns(mockDisposable);

            // Execute
            await command.toggleComplexityVisualization();

            // Verify
            expect(analyzerStub.analyzeFile.calledOnce).toBe(true);
            expect(mockEditor.setDecorations.called).toBe(true);
            expect(command.decorationDisposables.length).toBeGreaterThan(0);
            expect(mockShowInfoMessage.calledOnce).toBe(true);
            expect(mockShowInfoMessage.firstCall.args[0]).toContain('Complexity visualization enabled');
        });
    });

    describe('handleEditorChange', () => {
        it('should clear decorations when no editor provided', async () => {
            // Setup
            const mockDisposable1 = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable1];
            const clearDecorationsSpy = sandbox.spy(command, 'clearDecorations');

            // Execute
            await command.handleEditorChange();

            // Verify
            expect(clearDecorationsSpy.calledOnce).toBe(true);
            expect(mockDisposable1.dispose.calledOnce).toBe(true);
        });

        it('should update decorations for active decorations', async () => {
            // Setup
            const mockDisposable1 = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable1];
            const mockResult = {
                functions: [
                    { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
                ]
            };
            analyzerStub.analyzeFile.resolves(mockResult);
            vscode.window.createTextEditorDecorationType = sandbox.stub().returns(mockDisposable);

            // Execute
            await command.handleEditorChange(mockEditor);

            // Verify
            expect(mockDisposable1.dispose.calledOnce).toBe(true);
            expect(analyzerStub.analyzeFile.called).toBe(true);
        });
    });

    describe('clearDecorations', () => {
        it('should dispose all decorations', () => {
            // Setup
            const mockDisposable1 = { dispose: sandbox.stub() };
            const mockDisposable2 = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable1, mockDisposable2];

            // Execute
            command.clearDecorations();

            // Verify
            expect(mockDisposable1.dispose.calledOnce).toBe(true);
            expect(mockDisposable2.dispose.calledOnce).toBe(true);
            expect(command.decorationDisposables.length).toBe(0);
        });
    });
});
