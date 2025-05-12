import * as vscode from 'vscode';

export class ActivityBarView implements vscode.Disposable {
    private static readonly viewId = 'copilot-ppa.activityBar';
    private _view?: vscode.WebviewView;
    private readonly _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly viewsContainer: string
    ) {}

    public async initialize(): Promise<void> {
        // Register view
        this._disposables.push(
            vscode.window.registerWebviewViewProvider(
                ActivityBarView.viewId,
                {
                    resolveWebviewView: this._resolveWebviewView.bind(this),
                },
                {
                    webviewOptions: {
                        retainContextWhenHidden: true,
                    },
                }
            )
        );
    }

    private async _resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };

        webviewView.webview.html = this._getWebviewContent();

        this._registerMessageHandlers(webviewView);
    }

    private _registerMessageHandlers(webviewView: vscode.WebviewView): void {
        webviewView.webview.onDidReceiveMessage(
            async (message) => {
                try {
                    switch (message.type) {
                        case 'navigate':
                            await vscode.commands.executeCommand('workbench.view.extension.' + message.view);
                            break;
                        case 'refresh':
                            await this._updateView();
                            break;
                    }
                } catch (error) {
                    console.error('Error handling message:', error);
                }
            },
            undefined,
            this._disposables
        );
    }

    private async _updateView(): Promise<void> {
        if (this._view) {
            // Post update message to webview
            await this._view.webview.postMessage({ type: 'update' });
        }
    }

    private _getWebviewContent(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Copilot PPA Activity Bar</title>
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    background-color: var(--vscode-sideBar-background);
                    color: var(--vscode-sideBar-foreground);
                }
                .container {
                    padding: 10px;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .nav-item:hover {
                    background-color: var(--vscode-list-hoverBackground);
                }
                .nav-item.active {
                    background-color: var(--vscode-list-activeSelectionBackground);
                    color: var(--vscode-list-activeSelectionForeground);
                }
                .icon {
                    margin-right: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="nav-item" data-view="chatView">
                    <span class="icon">$(comment-discussion)</span>
                    <span>Chat</span>
                </div>
                <div class="nav-item" data-view="settingsView">
                    <span class="icon">$(settings-gear)</span>
                    <span>Settings</span>
                </div>
            </div>
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();

                    document.querySelectorAll('.nav-item').forEach(item => {
                        item.addEventListener('click', () => {
                            vscode.postMessage({
                                type: 'navigate',
                                view: item.dataset.view
                            });
                        });
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'update':
                                // Handle view updates
                                break;
                        }
                    });
                }())
            </script>
        </body>
        </html>`;
    }

    public dispose(): void {
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
