import * as vscode from 'vscode';

export class RepositoryPanelUIService implements vscode.Disposable {
    private readonly _disposables: vscode.Disposable[] = [];

    constructor(private readonly panel: vscode.WebviewPanel) {}

    public update(extensionUri: vscode.Uri): void {
        const webview = this.panel.webview;
        webview.html = this.getWebviewContent(extensionUri);
    }

    private getWebviewContent(extensionUri: vscode.Uri): string {
        const scriptPath = this.panel.webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'repository-panel.js')
        );
        const stylePath = this.panel.webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'media', 'repository-panel.css')
        );
        const codiconsUri = this.panel.webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css')
        );
        const nonce = this.generateNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${this.panel.webview.cspSource} https:;">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${stylePath}" rel="stylesheet">
            <link href="${codiconsUri}" rel="stylesheet">
            <title>Repository Management</title>
        </head>
        <body>
            <div class="container">
                <div class="repository-controls">
                    <h2>Repository Management</h2>
                    <div class="control-group">
                        <label for="provider">Provider:</label>
                        <select id="provider">
                            <option value="github">GitHub</option>
                            <option value="gitlab">GitLab</option>
                            <option value="bitbucket">Bitbucket</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label for="name">Repository Name:</label>
                        <input type="text" id="name" placeholder="my-repo">
                    </div>
                    <div class="control-group">
                        <label for="description">Description:</label>
                        <textarea id="description" placeholder="Repository description"></textarea>
                    </div>
                    <div class="control-group">
                        <label>
                            <input type="checkbox" id="private">
                            Private Repository
                        </label>
                    </div>
                    <div class="control-group">
                        <button id="createRepo">Create Repository</button>
                    </div>
                    <div class="control-group">
                        <button id="toggleAccess">
                            <span class="codicon codicon-shield"></span>
                            Toggle Repository Access
                        </button>
                    </div>
                </div>
                <div id="status" class="status-message"></div>
            </div>
            <script nonce="${nonce}" src="${scriptPath}"></script>
        </body>
        </html>`;
    }

    private generateNonce(): string {
        const arr = new Uint8Array(16);
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return Array.from(arr)
            .map((b: number) => b.toString(16).padStart(2, '0'))
            .join('');
    }

    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
    }
}