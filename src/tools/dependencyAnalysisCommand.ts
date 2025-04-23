import * as vscode from 'vscode';
import { LoggerService } from '../services/LoggerService';
import { DependencyAnalysisService } from '../services/dependencyAnalysis/DependencyAnalysisService';
import { DependencyGraphProvider } from '../webview/dependencyGraphView';

/**
 * Handles dependency analysis commands with comprehensive error handling
 */
export class DependencyAnalysisCommand {
    private readonly service: DependencyAnalysisService;
    private readonly graphProvider: DependencyGraphProvider;
    private readonly logger: LoggerService;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.service = new DependencyAnalysisService(context);
        this.graphProvider = new DependencyGraphProvider(context);
        this.logger = LoggerService.getInstance();
        this.registerEventHandlers();
    }

    public register(): vscode.Disposable {
        try {
            this.disposables.push(
                vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeDependencies', () => this.handleAnalyzeDependencies()),
                vscode.commands.registerCommand('vscodeLocalLLMAgent.analyzeFileDependencies', () => this.handleAnalyzeFileDependencies()),
                vscode.commands.registerCommand('vscodeLocalLLMAgent.showDependencyGraph', () => this.handleShowDependencyGraph())
            );

            return {
                dispose: () => {
                    this.disposables.forEach(d => d.dispose());
                    this.disposables.length = 0;
                    this.service.dispose();
                }
            };
        } catch (error) {
            this.handleError('Failed to register commands', error);
            throw error;
        }
    }

    private async handleAnalyzeDependencies(): Promise<void> {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) return;

            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Analyzing project dependencies...',
                cancellable: true
            }, async (progress) => {
                await this.service.analyzeDependencies(workspaceRoot, {
                    onProgress: (message: string) => {
                        progress.report({ message });
                    }
                });
            });
        } catch (error) {
            this.handleError('Failed to analyze dependencies', error);
        }
    }

    private async handleAnalyzeFileDependencies(): Promise<void> {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('Please open a file to analyze dependencies');
                return;
            }

            await this.service.analyzeFileDependencies(editor.document.uri);
        } catch (error) {
            this.handleError('Failed to analyze file dependencies', error);
        }
    }

    private async handleShowDependencyGraph(): Promise<void> {
        try {
            const workspaceRoot = this.getWorkspaceRoot();
            if (!workspaceRoot) return;

            await this.graphProvider.show(workspaceRoot);
        } catch (error) {
            this.handleError('Failed to show dependency graph', error);
        }
    }

    private getWorkspaceRoot(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders?.length) {
            vscode.window.showErrorMessage('Please open a workspace to analyze dependencies');
            return undefined;
        }
        return workspaceFolders[0].uri.fsPath;
    }

    private registerEventHandlers(): void {
        this.disposables.push(
            vscode.workspace.onDidChangeWorkspaceFolders(() => this.handleWorkspaceChange()),
            vscode.workspace.onDidChangeTextDocument(e => this.handleDocumentChange(e))
        );
    }

    private async handleWorkspaceChange(): Promise<void> {
        try {
            await this.service.reset();
        } catch (error) {
            this.handleError('Failed to handle workspace change', error);
        }
    }

    private async handleDocumentChange(e: vscode.TextDocumentChangeEvent): Promise<void> {
        try {
            if (this.shouldAnalyze(e.document)) {
                await this.service.invalidateCache(e.document.uri);
            }
        } catch (error) {
            this.handleError('Failed to handle document change', error);
        }
    }

    private shouldAnalyze(document: vscode.TextDocument): boolean {
        const analyzableExtensions = ['.ts', '.js', '.jsx', '.tsx', '.vue', '.json'];
        return analyzableExtensions.some(ext => document.fileName.endsWith(ext));
    }

    private handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`DependencyAnalysisCommand: ${message}`, errorMessage);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }
}
