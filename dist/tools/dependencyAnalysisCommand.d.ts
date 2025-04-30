import * as vscode from 'vscode';
/**
 * Handles dependency analysis commands with comprehensive error handling
 */
export declare class DependencyAnalysisCommand {
    private readonly service;
    private readonly graphProvider;
    private readonly logger;
    private readonly disposables;
    constructor(context: vscode.ExtensionContext);
    register(): vscode.Disposable;
    private handleAnalyzeDependencies;
    private handleAnalyzeFileDependencies;
    private handleShowDependencyGraph;
    private getWorkspaceRoot;
    private registerEventHandlers;
    private handleWorkspaceChange;
    private handleDocumentChange;
    private shouldAnalyze;
    private handleError;
}
