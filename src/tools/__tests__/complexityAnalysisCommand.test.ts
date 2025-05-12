import * as vscode from 'vscode';
import { CodeComplexityAnalyzer } from '../codeComplexityAnalyzer';
import { ComplexityAnalysisCommand } from '../complexityAnalysisCommand';

jest.mock('vscode');
jest.mock('../codeComplexityAnalyzer');

describe('ComplexityAnalysisCommand', () => {
    let command: ComplexityAnalysisCommand;
    let mockActiveEditor: vscode.TextEditor;
    let mockDocument: vscode.TextDocument;
    let mockDisposable: vscode.Disposable;
    let mockProgress: jest.Mock;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock vscode.window.activeTextEditor
        mockDocument = {
            uri: { fsPath: '/test/file.ts' },
            fileName: 'file.ts',
            getText: jest.fn()
        } as unknown as vscode.TextDocument;

        mockActiveEditor = {
            document: mockDocument
        } as unknown as vscode.TextEditor;

        (vscode.window as any).activeTextEditor = mockActiveEditor;

        // Mock vscode.window.withProgress
        mockProgress = jest.fn((options, task) => task());
        (vscode.window as any).withProgress = mockProgress;

        // Mock Disposable
        mockDisposable = { dispose: jest.fn() };
        (vscode.Disposable as any).from = jest.fn().mockReturnValue(mockDisposable);

        // Initialize command
        command = new ComplexityAnalysisCommand();
    });

    describe('register', () => {
        it('should register all commands and return disposable', () => {
            const result = command.register();

            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.analyzeFileComplexity',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.analyzeWorkspaceComplexity',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.toggleComplexityVisualization',
                expect.any(Function)
            );
            expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalledWith(
                expect.any(Function)
            );
            expect(result).toBe(mockDisposable);
        });
    });

    describe('analyzeCurrentFile', () => {
        const mockResult = {
            averageComplexity: 5.5,
            functions: [
                { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
            ]
        };

        beforeEach(() => {
            (CodeComplexityAnalyzer.prototype.analyzeFile as jest.Mock).mockResolvedValue(mockResult);
        });

        it('should analyze current file and show report', async () => {
            const analyzeCommand = jest.spyOn(command as any, 'analyzeCurrentFile');

            // Get the analyze file command callback
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.analyzeFileComplexity'
            );
            const callback = registerCall[1];

            // Call the command
            await callback();

            expect(analyzeCommand).toHaveBeenCalled();
            expect(mockProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Analyzing file complexity...'
                }),
                expect.any(Function)
            );
            expect(CodeComplexityAnalyzer.prototype.analyzeFile).toHaveBeenCalledWith('/test/file.ts');
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: expect.stringContaining('Complexity Analysis: file.ts'),
                    language: 'markdown'
                })
            );
        });

        it('should show warning when no active editor', async () => {
            (vscode.window as any).activeTextEditor = undefined;

            // Get the analyze file command callback
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.analyzeFileComplexity'
            );
            const callback = registerCall[1];

            // Call the command
            await callback();

            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active file to analyze.');
            expect(CodeComplexityAnalyzer.prototype.analyzeFile).not.toHaveBeenCalled();
        });
    });

    describe('analyzeWorkspace', () => {
        const mockResults = [
            {
                filePath: '/test/file1.ts',
                averageComplexity: 4.5,
                functions: []
            },
            {
                filePath: '/test/file2.ts',
                averageComplexity: 6.5,
                functions: []
            }
        ];

        beforeEach(() => {
            (vscode.workspace as any).workspaceFolders = [
                { uri: { fsPath: '/test' }, name: 'test' }
            ];
            (CodeComplexityAnalyzer.prototype.analyzeWorkspace as jest.Mock).mockResolvedValue(mockResults);
        });

        it('should analyze workspace and show report', async () => {
            // Get the analyze workspace command callback
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.analyzeWorkspaceComplexity'
            );
            const callback = registerCall[1];

            // Call the command
            await callback();

            expect(mockProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    location: vscode.ProgressLocation.Notification,
                    title: 'Analyzing workspace complexity...'
                }),
                expect.any(Function)
            );
            expect(CodeComplexityAnalyzer.prototype.analyzeWorkspace).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'test' })
            );
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(
                expect.objectContaining({
                    language: 'markdown'
                })
            );
        });

        it('should show warning when no workspace folders', async () => {
            (vscode.workspace as any).workspaceFolders = undefined;

            // Get the analyze workspace command callback
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.analyzeWorkspaceComplexity'
            );
            const callback = registerCall[1];

            // Call the command
            await callback();

            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No workspace folder open.');
            expect(CodeComplexityAnalyzer.prototype.analyzeWorkspace).not.toHaveBeenCalled();
        });
    });

    describe('toggleComplexityVisualization', () => {
        const mockResult = {
            functions: [
                { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
            ]
        };

        beforeEach(() => {
            (CodeComplexityAnalyzer.prototype.analyzeFile as jest.Mock).mockResolvedValue(mockResult);
            (CodeComplexityAnalyzer.prototype.visualizeComplexity as jest.Mock).mockReturnValue([mockDisposable]);
        });

        it('should enable visualization when disabled', async () => {
            // Get the toggle command callback
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.toggleComplexityVisualization'
            );
            const callback = registerCall[1];

            // Call the command
            await callback();

            expect(CodeComplexityAnalyzer.prototype.analyzeFile).toHaveBeenCalledWith('/test/file.ts');
            expect(CodeComplexityAnalyzer.prototype.visualizeComplexity).toHaveBeenCalledWith(
                mockActiveEditor,
                mockResult
            );
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Complexity visualization enabled.');
        });

        it('should disable visualization when enabled', async () => {
            // First enable visualization
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.toggleComplexityVisualization'
            );
            const callback = registerCall[1];
            await callback();

            // Then disable it
            await callback();

            expect(mockDisposable.dispose).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Complexity visualization disabled.');
        });

        it('should show warning when no active editor', async () => {
            (vscode.window as any).activeTextEditor = undefined;

            // Get the toggle command callback
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.toggleComplexityVisualization'
            );
            const callback = registerCall[1];

            // Call the command
            await callback();

            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('No active editor.');
            expect(CodeComplexityAnalyzer.prototype.analyzeFile).not.toHaveBeenCalled();
        });
    });

    describe('handleEditorChange', () => {
        const mockResult = {
            functions: [
                { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
            ]
        };

        beforeEach(() => {
            (CodeComplexityAnalyzer.prototype.analyzeFile as jest.Mock).mockResolvedValue(mockResult);
            (CodeComplexityAnalyzer.prototype.visualizeComplexity as jest.Mock).mockReturnValue([mockDisposable]);
        });

        it('should update decorations on editor change with active visualizations', async () => {
            // First enable visualization
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.toggleComplexityVisualization'
            );
            const callback = registerCall[1];
            await callback();

            // Get the editor change callback
            const changeCall = (vscode.window.onDidChangeActiveTextEditor as jest.Mock).mock.calls[0];
            const changeCallback = changeCall[0];

            // Call with new editor
            const newEditor = { ...mockActiveEditor, document: { ...mockDocument, uri: { fsPath: '/test/newfile.ts' } } };
            await changeCallback(newEditor);

            expect(CodeComplexityAnalyzer.prototype.analyzeFile).toHaveBeenCalledWith('/test/newfile.ts');
            expect(CodeComplexityAnalyzer.prototype.visualizeComplexity).toHaveBeenCalledWith(
                newEditor,
                mockResult
            );
        });

        it('should clear decorations when no new editor', async () => {
            // First enable visualization
            const registerCall = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.toggleComplexityVisualization'
            );
            const callback = registerCall[1];
            await callback();

            // Get the editor change callback
            const changeCall = (vscode.window.onDidChangeActiveTextEditor as jest.Mock).mock.calls[0];
            const changeCallback = changeCall[0];

            // Call with no editor
            await changeCallback(undefined);

            expect(mockDisposable.dispose).toHaveBeenCalled();
            expect(CodeComplexityAnalyzer.prototype.analyzeFile).not.toHaveBeenCalled();
        });
    });

    describe('generateFunctionsTable', () => {
        it('should generate table for functions sorted by complexity', () => {
            const result = {
                functions: [
                    { name: 'high', complexity: 16, startLine: 1, endLine: 10 },
                    { name: 'medium', complexity: 11, startLine: 11, endLine: 20 },
                    { name: 'low', complexity: 5, startLine: 21, endLine: 30 }
                ]
            };

            // Get private method
            const generateTable = (command as any).generateFunctionsTable.bind(command);
            const table = generateTable(result);

            expect(table).toContain('| Function | Complexity | Lines |');
            expect(table).toContain('| high | 🔴 16 | 1-10 |');
            expect(table).toContain('| medium | 🟠 11 | 11-20 |');
            expect(table).toContain('| low | 🟢 5 | 21-30 |');
        });

        it('should handle empty functions list', () => {
            const result = { functions: [] };

            // Get private method
            const generateTable = (command as any).generateFunctionsTable.bind(command);
            const table = generateTable(result);

            expect(table).toContain('*No functions found to analyze.*');
        });
    });
});
