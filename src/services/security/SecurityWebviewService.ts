import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { SecurityScanResult } from '../../types/security';

export class SecurityWebviewService {
    private readonly logger: Logger;

    constructor() {
        this.logger = Logger.getInstance();
    }

    public generateWebviewContent(webview: vscode.Webview, result?: SecurityScanResult): string {
        try {
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), '..', '..', '..', 'media', 'security-panel.js'));
            const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.Uri.file(__dirname), '..', '..', '..', 'media', 'security-panel.css'));

            return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Security Analysis</title>
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Security Analysis</h1>
                        <div class="actions">
                            <button id="refresh" class="action-button">Refresh</button>
                        </div>
                    </div>
                    <div id="summary" class="section">
                        <h2>Summary</h2>
                        <div id="summary-content"></div>
                    </div>
                    <div id="issues" class="section">
                        <h2>Security Issues</h2>
                        <div id="issues-content"></div>
                    </div>
                    <div id="recommendations" class="section">
                        <h2>Recommendations</h2>
                        <div id="recommendations-content"></div>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const initialState = ${JSON.stringify(result || {})};
                </script>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
        } catch (error) {
            this.logger.error('Error generating security webview content', error);
            throw error;
        }
    }
}
