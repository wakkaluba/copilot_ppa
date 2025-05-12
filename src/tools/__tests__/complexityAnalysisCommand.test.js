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

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create stub for CodeComplexityAnalyzer
        analyzerStub = sandbox.createStubInstance(CodeComplexityAnalyzer);

        // Mock vscode APIs
        mockShowErrorMessage = sandbox.stub(vscode.window, 'showErrorMessage');
        mockShowInfoMessage = sandbox.stub(vscode.window, 'showInformationMessage');
        registerCommandStub = sandbox.stub(vscode.commands, 'registerCommand');
        showTextDocumentStub = sandbox.stub(vscode.window, 'showTextDocument');

        // Create the command with the stubbed analyzer
        command = new ComplexityAnalysisCommand();
        command.complexityAnalyzer = analyzerStub;
    });

    afterEach(() => {
        sandbox.restore();
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
            const mockDisposable = { dispose: sandbox.stub() };
            registerCommandStub.returns(mockDisposable);

            // Execute
            const disposable = command.register();

            // Verify
            disposable.dispose();
            expect(mockDisposable.dispose.callCount).toBe(3);
        });
    });

    describe('analyzeCurrentFile', () => {
        it('should show warning when no active editor', async () => {
            // Setup
            sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

            // Execute
            await command.analyzeCurrentFile();

            // Verify
            expect(mockShowErrorMessage.calledWith('No active file to analyze.')).toBe(true);
            expect(analyzerStub.analyzeFile.called).toBe(false);
        });

        it('should analyze active file and show report', async () => {
            // Setup
            const mockDocument = { uri: { fsPath: '/test/file.ts' } };
            const mockEditor = { document: mockDocument };
            sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

            const mockResult = {
                averageComplexity: 5,
                functions: [
                    { name: 'testFunc', complexity: 3, startLine: 1, endLine: 10 }
                ]
            };
            analyzerStub.analyzeFile.resolves(mockResult);

            const mockDoc = { uri: { fsPath: '/test/report.md' } };
            sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockDoc);

            // Execute
            await command.analyzeCurrentFile();

            // Verify
            expect(analyzerStub.analyzeFile.calledWith(mockDocument.uri.fsPath)).toBe(true);
            expect(showTextDocumentStub.called).toBe(true);
            expect(analyzerStub.visualizeComplexity.called).toBe(true);
        });

        it('should handle unsupported file types', async () => {
            // Setup
            const mockDocument = { uri: { fsPath: '/test/file.ts' } };
            const mockEditor = { document: mockDocument };
            sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

            analyzerStub.analyzeFile.resolves(null);

            // Execute
            await command.analyzeCurrentFile();

            // Verify
            expect(mockShowInfoMessage.calledWith('File type not supported for complexity analysis.')).toBe(true);
            expect(analyzerStub.visualizeComplexity.called).toBe(false);
        });
    });

    describe('analyzeWorkspace', () => {
        it('should show warning when no workspace folders', async () => {
            // Setup
            sandbox.stub(vscode.workspace, 'workspaceFolders').value(undefined);

            // Execute
            await command.analyzeWorkspace();

            // Verify
            expect(mockShowErrorMessage.calledWith('No workspace folder open.')).toBe(true);
            expect(analyzerStub.analyzeWorkspace.called).toBe(false);
        });

        it('should analyze single workspace folder directly', async () => {
            // Setup
            const mockFolder = { uri: { fsPath: '/test/workspace' }, name: 'Test' };
            sandbox.stub(vscode.workspace, 'workspaceFolders').value([mockFolder]);

            const mockResults = [{
                filePath: '/test/file.ts',
                averageComplexity: 5,
                functions: []
            }];
            analyzerStub.analyzeWorkspace.resolves(mockResults);
            analyzerStub.generateComplexityReport.returns('Test Report');

            const mockDoc = { uri: { fsPath: '/test/report.md' } };
            sandbox.stub(vscode.workspace, 'openTextDocument').resolves(mockDoc);

            // Execute
            await command.analyzeWorkspace();

            // Verify
            expect(analyzerStub.analyzeWorkspace.calledWith(mockFolder)).toBe(true);
            expect(showTextDocumentStub.called).toBe(true);
        });

        it('should handle empty analysis results', async () => {
            // Setup
            const mockFolder = { uri: { fsPath: '/test/workspace' }, name: 'Test' };
            sandbox.stub(vscode.workspace, 'workspaceFolders').value([mockFolder]);

            analyzerStub.analyzeWorkspace.resolves([]);

            // Execute
            await command.analyzeWorkspace();

            // Verify
            expect(mockShowInfoMessage.calledWith('No files found for complexity analysis.')).toBe(true);
            expect(showTextDocumentStub.called).toBe(false);
        });
    });

    describe('toggleComplexityVisualization', () => {
        it('should show warning when no active editor', async () => {
            // Setup
            sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);

            // Execute
            await command.toggleComplexityVisualization();

            // Verify
            expect(mockShowErrorMessage.calledWith('No active editor.')).toBe(true);
        });

        it('should disable existing decorations', async () => {
            // Setup
            const mockEditor = { document: { uri: { fsPath: '/test/file.ts' } } };
            sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

            const mockDisposable = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable];

            // Execute
            await command.toggleComplexityVisualization();

            // Verify
            expect(mockDisposable.dispose.called).toBe(true);
            expect(mockShowInfoMessage.calledWith('Complexity visualization disabled.')).toBe(true);
        });

        it('should enable decorations for supported file', async () => {
            // Setup
            const mockEditor = { document: { uri: { fsPath: '/test/file.ts' } } };
            sandbox.stub(vscode.window, 'activeTextEditor').value(mockEditor);

            const mockResult = { functions: [] };
            analyzerStub.analyzeFile.resolves(mockResult);

            const mockDecorations = [{ dispose: () => {} }];
            analyzerStub.visualizeComplexity.returns(mockDecorations);

            // Execute
            await command.toggleComplexityVisualization();

            // Verify
            expect(analyzerStub.analyzeFile.called).toBe(true);
            expect(analyzerStub.visualizeComplexity.called).toBe(true);
            expect(mockShowInfoMessage.calledWith('Complexity visualization enabled.')).toBe(true);
        });
    });

    describe('handleEditorChange', () => {
        it('should clear decorations when no editor provided', async () => {
            // Setup
            const mockDisposable = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable];

            // Execute
            await command.handleEditorChange(undefined);

            // Verify
            expect(mockDisposable.dispose.called).toBe(true);
            expect(analyzerStub.analyzeFile.called).toBe(false);
        });

        it('should update decorations for active decorations', async () => {
            // Setup
            const mockEditor = { document: { uri: { fsPath: '/test/file.ts' } } };
            const mockDisposable = { dispose: sandbox.stub() };
            command.decorationDisposables = [mockDisposable];

            const mockResult = { functions: [] };
            analyzerStub.analyzeFile.resolves(mockResult);

            const mockNewDecorations = [{ dispose: () => {} }];
            analyzerStub.visualizeComplexity.returns(mockNewDecorations);

            // Execute
            await command.handleEditorChange(mockEditor);

            // Verify
            expect(mockDisposable.dispose.called).toBe(true);
            expect(analyzerStub.analyzeFile.called).toBe(true);
            expect(analyzerStub.visualizeComplexity.called).toBe(true);
        });
    });

    describe('clearDecorations', () => {
        it('should dispose all decorations', () => {
            // Setup
            const mockDisposables = [
                { dispose: sandbox.stub() },
                { dispose: sandbox.stub() }
            ];
            command.decorationDisposables = mockDisposables;

            // Execute
            command.clearDecorations();

            // Verify
            expect(mockDisposables[0].dispose.called).toBe(true);
            expect(mockDisposables[1].dispose.called).toBe(true);
            expect(command.decorationDisposables.length).toBe(0);
        });
    });
});
