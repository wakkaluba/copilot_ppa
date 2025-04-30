import * as vscode from 'vscode';
import { ThemeService } from '../../services/ui/themeManager';
import { WebviewState } from '../copilotIntegrationPanel';
export declare class CopilotWebviewContentService {
    private readonly themeService;
    constructor(themeService: ThemeService);
    generateWebviewContent(stylesUri: vscode.Uri, state: WebviewState, isConnected: boolean, webview: vscode.Webview): string;
    private renderMessages;
    private escapeHtml;
    private getClientScript;
}
