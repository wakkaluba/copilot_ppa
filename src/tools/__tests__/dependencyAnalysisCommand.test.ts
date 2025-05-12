import * as vscode from 'vscode';
import { DependencyAnalysisService } from '../../services/dependencyAnalysis/DependencyAnalysisService';
import { LoggerService } from '../../services/LoggerService';
import { DependencyGraphProvider } from '../../webview/dependencyGraphView';
import { DependencyAnalysisCommand } from '../dependencyAnalysisCommand';

jest.mock('vscode');
jest.mock('../../services/dependencyAnalysis/DependencyAnalysisService');
jest.mock('../../webview/dependencyGraphView');
jest.mock('../../services/LoggerService');

describe('DependencyAnalysisCommand', () => {
    let command: DependencyAnalysisCommand;
    let mockContext: vscode.ExtensionContext;
    let mockService: jest.Mocked<DependencyAnalysisService>;
    let mockGraphProvider: jest.Mocked<DependencyGraphProvider>;
    let mockLogger: jest.Mocked<LoggerService>;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/test',
            globalState: {} as any,
            workspaceState: {} as any,
            asAbsolutePath: (path: string) => path,
            storagePath: '/test/storage',
            logPath: '/test/log',
            extensionUri: {} as any,
            environmentVariableCollection: {} as any,
            storageUri: {} as any,
            logUri: {} as any,
            globalStorageUri: {} as any,
            extensionMode: vscode.ExtensionMode.Test,
            secrets: {} as any
        };

        mockService = {
            analyzeDependencies: jest.fn(),
            analyzeFileDependencies: jest.fn(),
            reset: jest.fn(),
            invalidateCache: jest.fn(),
            dispose: jest.fn()
        } as any;

        mockGraphProvider = {
            show: jest.fn()
        } as any;

        mockLogger = {
            getInstance: jest.fn(),
            error: jest.fn()
        } as any;

        (DependencyAnalysisService as jest.Mock).mockImplementation(() => mockService);
        (DependencyGraphProvider as jest.Mock).mockImplementation(() => mockGraphProvider);
        (LoggerService.getInstance as jest.Mock).mockReturnValue(mockLogger);

        command = new DependencyAnalysisCommand(mockContext);
    });

    describe('register', () => {
        it('should register all commands and return a disposable', () => {
            const mockRegisterCommand = vscode.commands.registerCommand as jest.Mock;
            const disposable = command.register();

            expect(mockRegisterCommand).toHaveBeenCalledWith(
                'copilot-ppa.analyzeDependencies',
                expect.any(Function)
            );
            expect(mockRegisterCommand).toHaveBeenCalledWith(
                'copilot-ppa.analyzeFileDependencies',
                expect.any(Function)
            );
            expect(mockRegisterCommand).toHaveBeenCalledWith(
                'copilot-ppa.showDependencyGraph',
                expect.any(Function)
            );

            expect(disposable.dispose).toBeDefined();
        });

        it('should properly dispose of resources', () => {
            const disposable = command.register();
            disposable.dispose();

            expect(mockService.dispose).toHaveBeenCalled();
        });

        it('should handle registration errors', () => {
            const error = new Error('Registration failed');
            (vscode.commands.registerCommand as jest.Mock).mockImplementationOnce(() => {
                throw error;
            });

            expect(() => command.register()).toThrow(error);
            expect(mockLogger.error).toHaveBeenCalledWith(
                'DependencyAnalysisCommand: Failed to register commands',
                error.message
            );
        });
    });

    describe('handleAnalyzeDependencies', () => {
        beforeEach(() => {
            (vscode.workspace.workspaceFolders as any) = [{ uri: { fsPath: '/test/workspace' } }];
        });

        it('should analyze dependencies with progress', async () => {
            const mockWithProgress = vscode.window.withProgress as jest.Mock;
            mockWithProgress.mockImplementation(async (_, task) => task());

            await (command as any).handleAnalyzeDependencies();

            expect(mockService.analyzeDependencies).toHaveBeenCalledWith(
                '/test/workspace',
                expect.any(Object)
            );
        });

        it('should handle missing workspace', async () => {
            (vscode.workspace.workspaceFolders as any) = undefined;

            await (command as any).handleAnalyzeDependencies();

            expect(mockService.analyzeDependencies).not.toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Please open a workspace to analyze dependencies'
            );
        });

        it('should handle analysis errors', async () => {
            const error = new Error('Analysis failed');
            mockService.analyzeDependencies.mockRejectedValueOnce(error);

            await (command as any).handleAnalyzeDependencies();

            expect(mockLogger.error).toHaveBeenCalledWith(
                'DependencyAnalysisCommand: Failed to analyze dependencies',
                error.message
            );
        });
    });

    describe('handleAnalyzeFileDependencies', () => {
        it('should analyze file dependencies when editor is active', async () => {
            const mockEditor = {
                document: { uri: { fsPath: '/test/file.ts' } }
            };
            (vscode.window.activeTextEditor as any) = mockEditor;

            await (command as any).handleAnalyzeFileDependencies();

            expect(mockService.analyzeFileDependencies).toHaveBeenCalledWith(mockEditor.document.uri);
        });

        it('should handle missing active editor', async () => {
            (vscode.window.activeTextEditor as any) = undefined;

            await (command as any).handleAnalyzeFileDependencies();

            expect(mockService.analyzeFileDependencies).not.toHaveBeenCalled();
            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(
                'Please open a file to analyze dependencies'
            );
        });

        it('should handle analysis errors', async () => {
            (vscode.window.activeTextEditor as any) = {
                document: { uri: { fsPath: '/test/file.ts' } }
            };
            const error = new Error('Analysis failed');
            mockService.analyzeFileDependencies.mockRejectedValueOnce(error);

            await (command as any).handleAnalyzeFileDependencies();

            expect(mockLogger.error).toHaveBeenCalledWith(
                'DependencyAnalysisCommand: Failed to analyze file dependencies',
                error.message
            );
        });
    });

    describe('handleShowDependencyGraph', () => {
        beforeEach(() => {
            (vscode.workspace.workspaceFolders as any) = [{ uri: { fsPath: '/test/workspace' } }];
        });

        it('should show dependency graph', async () => {
            await (command as any).handleShowDependencyGraph();

            expect(mockGraphProvider.show).toHaveBeenCalledWith('/test/workspace');
        });

        it('should handle missing workspace', async () => {
            (vscode.workspace.workspaceFolders as any) = undefined;

            await (command as any).handleShowDependencyGraph();

            expect(mockGraphProvider.show).not.toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                'Please open a workspace to analyze dependencies'
            );
        });

        it('should handle graph errors', async () => {
            const error = new Error('Graph failed');
            mockGraphProvider.show.mockRejectedValueOnce(error);

            await (command as any).handleShowDependencyGraph();

            expect(mockLogger.error).toHaveBeenCalledWith(
                'DependencyAnalysisCommand: Failed to show dependency graph',
                error.message
            );
        });
    });

    describe('handleDocumentChange', () => {
        it('should invalidate cache for supported file types', async () => {
            const mockDocument = {
                uri: { fsPath: '/test/file.ts' },
                fileName: '/test/file.ts'
            };

            await (command as any).handleDocumentChange({ document: mockDocument });

            expect(mockService.invalidateCache).toHaveBeenCalledWith(mockDocument.uri);
        });

        it('should not invalidate cache for unsupported file types', async () => {
            const mockDocument = {
                uri: { fsPath: '/test/file.xyz' },
                fileName: '/test/file.xyz'
            };

            await (command as any).handleDocumentChange({ document: mockDocument });

            expect(mockService.invalidateCache).not.toHaveBeenCalled();
        });

        it('should handle invalidation errors', async () => {
            const mockDocument = {
                uri: { fsPath: '/test/file.ts' },
                fileName: '/test/file.ts'
            };
            const error = new Error('Cache invalidation failed');
            mockService.invalidateCache.mockRejectedValueOnce(error);

            await (command as any).handleDocumentChange({ document: mockDocument });

            expect(mockLogger.error).toHaveBeenCalledWith(
                'DependencyAnalysisCommand: Failed to handle document change',
                error.message
            );
        });
    });

    describe('shouldAnalyze', () => {
        it.each([
            ['.ts', true],
            ['.js', true],
            ['.jsx', true],
            ['.tsx', true],
            ['.vue', true],
            ['.json', true],
            ['.xyz', false],
            ['.md', false]
        ])('should correctly identify analyzable files for %s extension', (ext, expected) => {
            const mockDocument = {
                fileName: `/test/file${ext}`
            };

            const result = (command as any).shouldAnalyze(mockDocument);

            expect(result).toBe(expected);
        });
    });
});
