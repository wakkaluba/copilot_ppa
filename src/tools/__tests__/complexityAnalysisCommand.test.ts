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
    let mockAnalyzer: jest.Mocked<CodeComplexityAnalyzer>;
    let mockShowErrorMessage: jest.SpyInstance;
    let mockShowInfoMessage: jest.SpyInstance;
    let mockCreateTextDocument: jest.SpyInstance;
    let mockShowTextDocument: jest.SpyInstance;
    let mockRegisterCommand: jest.SpyInstance;
    let mockCreateTextEditorDecorationType: jest.SpyInstance;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock vscode.window.activeTextEditor
        mockDocument = {
            uri: { fsPath: '/test/file.ts' },
            fileName: 'file.ts',
            languageId: 'typescript',
            getText: jest.fn().mockReturnValue('function test() { }')
        } as unknown as vscode.TextDocument;

        mockActiveEditor = {
            document: mockDocument,
            setDecorations: jest.fn()
        } as unknown as vscode.TextEditor;

        (vscode.window as any).activeTextEditor = mockActiveEditor;

        // Mock vscode.window.withProgress
        mockProgress = jest.fn((options, task) => task());
        (vscode.window as any).withProgress = mockProgress;

        // Mock Disposable
        mockDisposable = { dispose: jest.fn() };
        (vscode.Disposable as any).from = jest.fn().mockReturnValue(mockDisposable);

        // Mock analyzer
        mockAnalyzer = {
            analyzeFile: jest.fn(),
            analyzeWorkspace: jest.fn(),
            visualizeComplexity: jest.fn(),
            generateComplexityReport: jest.fn()
        } as unknown as jest.Mocked<CodeComplexityAnalyzer>;

        (CodeComplexityAnalyzer as jest.Mock).mockImplementation(() => mockAnalyzer);

        // Mock vscode functions
        mockShowErrorMessage = jest.spyOn(vscode.window, 'showErrorMessage').mockImplementation(jest.fn());
        mockShowInfoMessage = jest.spyOn(vscode.window, 'showInformationMessage').mockImplementation(jest.fn());
        mockCreateTextDocument = jest.spyOn(vscode.workspace, 'openTextDocument').mockResolvedValue({} as any);
        mockShowTextDocument = jest.spyOn(vscode.window, 'showTextDocument').mockResolvedValue({} as any);
        mockRegisterCommand = jest.spyOn(vscode.commands, 'registerCommand').mockReturnValue({ dispose: jest.fn() });
        mockCreateTextEditorDecorationType = jest.spyOn(vscode.window, 'createTextEditorDecorationType').mockReturnValue({ dispose: jest.fn() });

        // Initialize command
        command = new ComplexityAnalysisCommand();
    });

    describe('register', () => {
        it('should register all commands and return disposable', () => {
            // Execute
            const result = command.register();

            // Verify
            expect(mockRegisterCommand).toHaveBeenCalledTimes(3);
            expect(mockRegisterCommand).toHaveBeenCalledWith(
                'copilot-ppa.analyzeFileComplexity',
                expect.any(Function)
            );
            expect(mockRegisterCommand).toHaveBeenCalledWith(
                'copilot-ppa.analyzeWorkspaceComplexity',
                expect.any(Function)
            );
            expect(mockRegisterCommand).toHaveBeenCalledWith(
                'copilot-ppa.toggleComplexityVisualization',
                expect.any(Function)
            );
            expect(vscode.Disposable.from).toHaveBeenCalled();
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
            (mockAnalyzer.analyzeFile as jest.Mock).mockResolvedValue(mockResult);
            (mockAnalyzer.generateComplexityReport as jest.Mock).mockReturnValue('Test Report');
        });

        it('should analyze current file and show report', async () => {
            // Execute
            await (command as any).analyzeCurrentFile();

            // Verify
            expect(mockProgress).toHaveBeenCalled();
            expect(mockAnalyzer.analyzeFile).toHaveBeenCalledWith('/test/file.ts');
            expect(mockAnalyzer.generateComplexityReport).toHaveBeenCalledWith(mockResult);
            expect(mockCreateTextDocument).toHaveBeenCalled();
            expect(mockShowTextDocument).toHaveBeenCalled();
        });

        it('should show warning when no active editor', async () => {
            // Setup
            (vscode.window as any).activeTextEditor = undefined;

            // Execute
            await (command as any).analyzeCurrentFile();

            // Verify
            expect(mockShowErrorMessage).toHaveBeenCalled();
            expect(mockAnalyzer.analyzeFile).not.toHaveBeenCalled();
        });

        it('should handle unsupported file type', async () => {
            // Setup
            (mockDocument as any).languageId = 'markdown';
            (mockAnalyzer.analyzeFile as jest.Mock).mockResolvedValue(null);

            // Execute
            await (command as any).analyzeCurrentFile();

            // Verify
            expect(mockShowInfoMessage).toHaveBeenCalled();
            expect(mockCreateTextDocument).not.toHaveBeenCalled();
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
            (mockAnalyzer.analyzeWorkspace as jest.Mock).mockResolvedValue(mockResults);
            (mockAnalyzer.generateComplexityReport as jest.Mock).mockReturnValue('Test Report');
            (vscode.workspace as any).workspaceFolders = [{ uri: { fsPath: '/test/workspace' }, name: 'test' }];
        });

        it('should analyze workspace and show report', async () => {
            // Execute
            await (command as any).analyzeWorkspace();

            // Verify
            expect(mockProgress).toHaveBeenCalled();
            expect(mockAnalyzer.analyzeWorkspace).toHaveBeenCalledWith('/test/workspace');
            expect(mockAnalyzer.generateComplexityReport).toHaveBeenCalled();
            expect(mockCreateTextDocument).toHaveBeenCalled();
            expect(mockShowTextDocument).toHaveBeenCalled();
        });

        it('should show warning when no workspace folders', async () => {
            // Setup
            (vscode.workspace as any).workspaceFolders = undefined;

            // Execute
            await (command as any).analyzeWorkspace();

            // Verify
            expect(mockShowErrorMessage).toHaveBeenCalled();
            expect(mockAnalyzer.analyzeWorkspace).not.toHaveBeenCalled();
        });

        it('should handle empty results', async () => {
            // Setup
            (mockAnalyzer.analyzeWorkspace as jest.Mock).mockResolvedValue([]);

            // Execute
            await (command as any).analyzeWorkspace();

            // Verify
            expect(mockShowInfoMessage).toHaveBeenCalled();
            expect(mockCreateTextDocument).not.toHaveBeenCalled();
        });
    });

    describe('toggleComplexityVisualization', () => {
        const mockResult = {
            functions: [
                { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
            ]
        };

        beforeEach(() => {
            (mockAnalyzer.analyzeFile as jest.Mock).mockResolvedValue(mockResult);
            (mockAnalyzer.visualizeComplexity as jest.Mock).mockReturnValue([{ dispose: jest.fn() }]);
        });

        it('should enable visualization when disabled', async () => {
            // Setup
            (command as any).decorationDisposables = [];

            // Execute
            await (command as any).toggleComplexityVisualization();

            // Verify
            expect(mockAnalyzer.analyzeFile).toHaveBeenCalledWith('/test/file.ts');
            expect(mockAnalyzer.visualizeComplexity).toHaveBeenCalled();
            expect(mockShowInfoMessage).toHaveBeenCalledWith('Complexity visualization enabled.');
            expect((command as any).decorationDisposables.length).toBeGreaterThan(0);
        });

        it('should disable visualization when enabled', async () => {
            // Setup
            const mockDisposable = { dispose: jest.fn() };
            (command as any).decorationDisposables = [mockDisposable];

            // Execute
            await (command as any).toggleComplexityVisualization();

            // Verify
            expect(mockDisposable.dispose).toHaveBeenCalled();
            expect(mockShowInfoMessage).toHaveBeenCalledWith('Complexity visualization disabled.');
            expect((command as any).decorationDisposables.length).toBe(0);
        });

        it('should show warning when no active editor', async () => {
            // Setup
            (vscode.window as any).activeTextEditor = undefined;

            // Execute
            await (command as any).toggleComplexityVisualization();

            // Verify
            expect(mockShowErrorMessage).toHaveBeenCalled();
            expect(mockAnalyzer.analyzeFile).not.toHaveBeenCalled();
        });
    });

    describe('handleEditorChange', () => {
        const mockResult = {
            functions: [
                { name: 'test', complexity: 3, startLine: 1, endLine: 10 }
            ]
        };

        beforeEach(() => {
            (mockAnalyzer.analyzeFile as jest.Mock).mockResolvedValue(mockResult);
            (mockAnalyzer.visualizeComplexity as jest.Mock).mockReturnValue([{ dispose: jest.fn() }]);
        });

        it('should clear decorations when no editor provided', async () => {
            // Setup
            const mockDisp = { dispose: jest.fn() };
            (command as any).decorationDisposables = [mockDisp];
            const clearSpy = jest.spyOn(command as any, 'clearDecorations');

            // Execute
            await (command as any).handleEditorChange();

            // Verify
            expect(clearSpy).toHaveBeenCalled();
            expect(mockDisp.dispose).toHaveBeenCalled();
            expect((command as any).decorationDisposables.length).toBe(0);
        });

        it('should update decorations for active editor when decorations exist', async () => {
            // Setup
            const mockDisp = { dispose: jest.fn() };
            (command as any).decorationDisposables = [mockDisp];

            // Execute
            await (command as any).handleEditorChange(mockActiveEditor);

            // Verify
            expect(mockDisp.dispose).toHaveBeenCalled();
            expect(mockAnalyzer.analyzeFile).toHaveBeenCalled();
            expect(mockAnalyzer.visualizeComplexity).toHaveBeenCalled();
            expect((command as any).decorationDisposables.length).toBeGreaterThan(0);
        });
    });

    describe('clearDecorations', () => {
        it('should dispose all decorations', () => {
            // Setup
            const mockDisp1 = { dispose: jest.fn() };
            const mockDisp2 = { dispose: jest.fn() };
            (command as any).decorationDisposables = [mockDisp1, mockDisp2];

            // Execute
            (command as any).clearDecorations();

            // Verify
            expect(mockDisp1.dispose).toHaveBeenCalled();
            expect(mockDisp2.dispose).toHaveBeenCalled();
            expect((command as any).decorationDisposables.length).toBe(0);
        });
    });

    describe('generateFunctionsTable', () => {
        it('should format a markdown table with functions data', () => {
            // Setup
            const result = {
                functions: [
                    { name: 'function1', complexity: 5, startLine: 10, endLine: 20 },
                    { name: 'function2', complexity: 2, startLine: 30, endLine: 40 },
                    { name: 'function3', complexity: 8, startLine: 50, endLine: 60 }
                ]
            };

            // Execute
            const table = (command as any).generateFunctionsTable(result);

            // Verify
            expect(table).toContain('| Function | Complexity | Lines |');
            expect(table).toContain('| function1 | 5 | 10-20 |');
            expect(table).toContain('| function2 | 2 | 30-40 |');
            expect(table).toContain('| function3 | 8 | 50-60 |');
        });

        it('should handle empty functions array', () => {
            // Setup
            const result = { functions: [] };

            // Execute
            const table = (command as any).generateFunctionsTable(result);

            // Verify
            expect(table).toContain('No functions found');
        });
    });
});
