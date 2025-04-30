import * as vscode from 'vscode';
import { LLMModelsManager } from './llmModels';
export declare class LLMSelectionView {
    private panel?;
    private context;
    private modelsManager;
    constructor(context: vscode.ExtensionContext, modelsManager: LLMModelsManager);
    /**
     * Show the LLM selection view
     */
    show(): void;
    /**
     * Update the webview content
     */
    private updateView;
    /**
     * Generate the HTML content for the webview
     */
    private getWebviewContent;
    /**
     * Generate HTML for model cards
     */
    private generateModelCards;
    /**
     * Format provider name for display
     */
    private formatProviderName;
    /**
     * Handle messages from the webview
     */
    private handleWebviewMessage;
    /**
     * Generate a nonce for content security policy
     */
    private getNonce;
}
