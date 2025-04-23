import * as vscode from 'vscode';
import { DependencyGraphService } from '../services/dependencyGraph/DependencyGraphService';
import { DependencyGraphRenderer } from './renderers/DependencyGraphRenderer';
import { LoggerService } from '../services/LoggerService';
import { WebviewContentProvider } from './base/WebviewContentProvider';

/**
 * Provides interactive dependency graph visualization
 */
export class DependencyGraphViewProvider implements WebviewContentProvider {
    public static readonly viewType = 'dependencyGraph.view';
    private readonly graphService: DependencyGraphService;
    private readonly renderer: DependencyGraphRenderer;
    private readonly logger: LoggerService;
    private readonly disposables: vscode.Disposable[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.graphService = new DependencyGraphService();
        this.renderer = new DependencyGraphRenderer();
        this.logger = LoggerService.getInstance();
        this.registerEventHandlers(context);
    }

    /**
     * Creates and shows the dependency graph panel
     */
    public async show(workspaceRoot: string): Promise<void> {
        try {
            const panel = this.createWebviewPanel();
            const dependencies = await this.graphService.analyzeDependencies(workspaceRoot);
            panel.webview.html = this.renderer.render(dependencies);
            this.setupMessageHandling(panel);
            this.disposables.push(panel);
        } catch (error) {
            this.handleError('Failed to show dependency graph', error);
        }
    }

    /**
     * Updates the graph when dependencies change
     */
    public async update(panel: vscode.WebviewPanel, workspaceRoot: string): Promise<void> {
        try {
            const dependencies = await this.graphService.analyzeDependencies(workspaceRoot);
            panel.webview.html = this.renderer.render(dependencies);
        } catch (error) {
            this.handleError('Failed to update dependency graph', error);
        }
    }

    /**
     * Cleans up resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables.length = 0;
        this.graphService.dispose();
    }

    private createWebviewPanel(): vscode.WebviewPanel {
        return vscode.window.createWebviewPanel(
            DependencyGraphViewProvider.viewType,
            'Dependency Graph',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.getLocalResourceRoot()]
            }
        );
    }

    private setupMessageHandling(panel: vscode.WebviewPanel): void {
        panel.webview.onDidReceiveMessage(async message => {
            try {
                switch (message.command) {
                    case 'refresh':
                        await this.update(panel, message.workspaceRoot);
                        break;
                    case 'exportSvg':
                        await this.exportGraph(message.data);
                        break;
                    default:
                        this.logger.warn(`Unknown command: ${message.command}`);
                }
            } catch (error) {
                this.handleError(`Failed to handle message: ${message.command}`, error);
            }
        }, null, this.disposables);
    }

    private registerEventHandlers(context: vscode.ExtensionContext): void {
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(e => this.handleDocumentChange(e)),
            vscode.workspace.onDidChangeWorkspaceFolders(() => this.handleWorkspaceChange())
        );
    }

    private async handleDocumentChange(e: vscode.TextDocumentChangeEvent): Promise<void> {
        if (this.shouldUpdateOnChange(e.document)) {
            await this.notifyDependencyChange();
        }
    }

    private async handleWorkspaceChange(): Promise<void> {
        await this.notifyDependencyChange();
    }

    private shouldUpdateOnChange(document: vscode.TextDocument): boolean {
        const relevantFiles = ['.ts', '.js', '.json', '.yaml', '.yml'];
        return relevantFiles.some(ext => document.fileName.endsWith(ext));
    }

    private async notifyDependencyChange(): Promise<void> {
        try {
            await vscode.commands.executeCommand('dependencyGraph.refresh');
        } catch (error) {
            this.handleError('Failed to notify dependency change', error);
        }
    }

    private async exportGraph(svgData: string): Promise<void> {
        try {
            const uri = await vscode.window.showSaveDialog({
                filters: { 'SVG files': ['svg'] }
            });
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(svgData));
                vscode.window.showInformationMessage('Dependency graph exported successfully');
            }
        } catch (error) {
            this.handleError('Failed to export graph', error);
        }
    }

    private getLocalResourceRoot(): vscode.Uri {
        return vscode.Uri.joinPath(vscode.Uri.file(__dirname), 'media');
    }

    private handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`DependencyGraphView: ${message}`, errorMessage);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }
}
