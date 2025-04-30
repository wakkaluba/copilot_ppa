import * as vscode from 'vscode';
import { WebviewContentProvider } from './base/WebviewContentProvider';
/**
 * Provides interactive dependency graph visualization
 */
export declare class DependencyGraphViewProvider implements WebviewContentProvider {
    static readonly viewType = "dependencyGraph.view";
    private readonly graphService;
    private readonly renderer;
    private readonly logger;
    private readonly disposables;
    constructor(context: vscode.ExtensionContext);
    /**
     * Creates and shows the dependency graph panel
     */
    show(workspaceRoot: string): Promise<void>;
    /**
     * Updates the graph when dependencies change
     */
    update(panel: vscode.WebviewPanel, workspaceRoot: string): Promise<void>;
    /**
     * Cleans up resources
     */
    dispose(): void;
    private createWebviewPanel;
    private setupMessageHandling;
    private registerEventHandlers;
    private handleDocumentChange;
    private handleWorkspaceChange;
    private shouldUpdateOnChange;
    private notifyDependencyChange;
    private exportGraph;
    private getLocalResourceRoot;
    private handleError;
}
