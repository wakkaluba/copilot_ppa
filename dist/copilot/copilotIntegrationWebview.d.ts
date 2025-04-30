import * as vscode from 'vscode';
import { CopilotIntegrationService } from './copilotIntegrationService';
/**
 * WebView implementation for Copilot integration UI
 */
export declare class CopilotIntegrationWebview {
    private readonly context;
    static readonly viewType = "copilotIntegration.webview";
    private service;
    /**
     * Creates a new instance of the CopilotIntegrationWebview
     * @param context The extension context
     * @param copilotService The Copilot integration service
     */
    constructor(context: vscode.ExtensionContext, copilotService: CopilotIntegrationService);
    /**
     * Creates and shows the webview panel
     */
    show(): Promise<void>;
    /**
     * Disposes of the webview panel
     */
    private dispose;
}
