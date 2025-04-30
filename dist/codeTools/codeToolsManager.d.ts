import * as vscode from 'vscode';
/**
 * Central manager for all code tools integrations
 */
export declare class CodeToolsManager {
    private context;
    private linterIntegration;
    private complexityAnalyzer;
    private refactoringTools;
    private documentationGenerator;
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize all code tools
     */
    initialize(): Promise<void>;
    /**
     * Register all commands for code tools
     */
    private registerCommands;
    /**
     * Dispose all resources
     */
    dispose(): void;
}
