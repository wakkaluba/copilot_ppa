import * as vscode from 'vscode';
/**
 * Manages code formatting and optimization functionality
 */
export declare class CodeFormattingManager {
    private context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Register all formatting and optimization related commands
     */
    private registerCommands;
    /**
     * Format the entire active document
     */
    private formatDocument;
    /**
     * Format only the selected text
     */
    private formatSelection;
    /**
     * Organize imports in the current document
     */
    private organizeImports;
    /**
     * Use the connected LLM to optimize code
     */
    private optimizeCodeWithLLM;
    /**
     * Call the LLM service to optimize code
     * This is a placeholder for the actual LLM integration
     */
    private callLLMForCodeOptimization;
}
