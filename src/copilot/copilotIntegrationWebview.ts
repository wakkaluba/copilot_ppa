import * as vscode from 'vscode';
import * as path from 'path';
import { CopilotIntegrationService } from './copilotIntegrationService';
import { CopilotIntegrationWebviewService } from './services/CopilotIntegrationWebviewService';

/**
 * WebView implementation for Copilot integration UI
 */
export class CopilotIntegrationWebview {
    public static readonly viewType = 'copilotIntegration.webview';
    private service: CopilotIntegrationWebviewService;

    /**
     * Creates a new instance of the CopilotIntegrationWebview
     * @param context The extension context
     * @param copilotService The Copilot integration service
     */
    constructor(
        private readonly context: vscode.ExtensionContext,
        copilotService: CopilotIntegrationService
    ) {
        this.service = new CopilotIntegrationWebviewService(context, copilotService);
    }

    /**
     * Creates and shows the webview panel
     */
    public async show() {
        await this.service.show();
    }

    /**
     * Disposes of the webview panel
     */
    private dispose() {
        this.service.dispose();
    }
}
