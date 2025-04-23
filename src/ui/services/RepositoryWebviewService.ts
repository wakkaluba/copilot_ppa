import * as vscode from 'vscode';
import { ThemeService } from '../../services/ui/themeManager';

export class RepositoryWebviewService {
    constructor(private readonly themeService: ThemeService) {}

    public generateWebviewContent(webview: vscode.Webview): string {
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(ThemeService.extensionUri, 'media', 'repository-panel.css'));

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Repository Panel</title>
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div class="container">
                    <div class="repository-status"></div>
                    <div class="repository-info"></div>
                    <div class="repository-actions"></div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                </script>
            </body>
            </html>
        `;
    }
}
