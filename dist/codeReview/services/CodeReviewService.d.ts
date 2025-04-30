import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
export declare class CodeReviewService {
    private readonly logger;
    private pullRequestIntegration;
    private reviewChecklist;
    constructor(logger: ILogger, context: vscode.ExtensionContext);
    getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string;
    handleWebviewMessage(message: any): Promise<any>;
    private handleRefreshPullRequests;
    private generateHtml;
    private generateNonce;
}
