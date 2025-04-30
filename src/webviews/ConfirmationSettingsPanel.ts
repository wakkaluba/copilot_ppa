import * as vscode from 'vscode';
import { UserConfirmationService } from '../services/UserConfirmationService';

/**
 * WebView panel for configuring user confirmation settings
 */
export class ConfirmationSettingsPanel {
    public static readonly viewType = 'confirmationSettings';
    private static instance: ConfirmationSettingsPanel | undefined;

    private readonly panel: vscode.WebviewPanel;
    private readonly extensionUri: vscode.Uri;
    private readonly confirmationService: UserConfirmationService;
    private disposables: vscode.Disposable[] = [];

    private constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
        this.confirmationService = UserConfirmationService.getInstance();

        // Create and show panel
        this.panel = vscode.window.createWebviewPanel(
            ConfirmationSettingsPanel.viewType,
            'Confirmation Settings',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [extensionUri]
            }
        );

        // Set initial HTML content
        this.panel.webview.html = this._getHtmlForWebview();

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => this._handleMessage(message),
            null,
            this.disposables
        );

        // Listen for when the panel is disposed
        this.panel.onDidDispose(
            () => this.dispose(),
            null,
            this.disposables
        );
    }

    /**
     * Creates and shows a new webview panel or reveals an existing one
     */
    public static createOrShow(extensionUri: vscode.Uri): ConfirmationSettingsPanel {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it
        if (ConfirmationSettingsPanel.instance) {
            ConfirmationSettingsPanel.instance.panel.reveal(column);
            return ConfirmationSettingsPanel.instance;
        }

        // Otherwise, create and show a new panel
        const panel = new ConfirmationSettingsPanel(extensionUri);
        ConfirmationSettingsPanel.instance = panel;
        return panel;
    }

    /**
     * Handles messages from the webview
     */
    private async _handleMessage(message: any): Promise<void> {
        switch (message.command) {
            case 'toggleSetting':
                if (message.enable) {
                    await this.confirmationService.enableConfirmation(message.type);
                } else {
                    // We're using private method via any type to access the disableConfirmation method
                    // which is normally only accessible within the class
                    await (this.confirmationService as any).disableConfirmation(message.type);
                }
                // Update UI after toggling
                this.panel.webview.postMessage({ command: 'settingsUpdated', settings: await this._getSettings() });
                break;
            case 'getSettings':
                this.panel.webview.postMessage({ command: 'settingsUpdated', settings: await this._getSettings() });
                break;
        }
    }

    /**
     * Gets the current settings from the configuration
     */
    private async _getSettings(): Promise<{[key: string]: boolean}> {
        const config = vscode.workspace.getConfiguration('copilotPPA.confirmations');
        return {
            file: !config.get<boolean>('disableFileConfirmations', false),
            workspace: !config.get<boolean>('disableWorkspaceConfirmations', false),
            process: !config.get<boolean>('disableProcessConfirmations', false),
            other: !config.get<boolean>('disableOtherConfirmations', false)
        };
    }

    /**
     * Returns the HTML content for the webview
     */
    private _getHtmlForWebview(): string {
        const webview = this.panel.webview;

        // Get the local path to main script run in the webview, then convert to webview URI
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'confirmationSettings.js')
        );

        // Get styles
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'confirmationSettings.css')
        );

        // Use a nonce to only allow specific scripts to be run
        const nonce = getNonce();

        // HTML content
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
            <link href="${styleUri}" rel="stylesheet">
            <title>Confirmation Settings</title>
        </head>
        <body>
            <header>
                <h1>Confirmation Settings</h1>
                <p class="description">Configure when confirmation dialogs should be shown</p>
            </header>

            <div class="settings-container">
                <div class="setting-item">
                    <div class="setting-text">
                        <h3>File Operations</h3>
                        <p>Show confirmations before file changes</p>
                    </div>
                    <div class="toggle-switch">
                        <label class="switch">
                            <input type="checkbox" id="file-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-text">
                        <h3>Workspace Operations</h3>
                        <p>Show confirmations before workspace changes</p>
                    </div>
                    <div class="toggle-switch">
                        <label class="switch">
                            <input type="checkbox" id="workspace-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-text">
                        <h3>Long-Running Processes</h3>
                        <p>Show confirmations before starting long operations</p>
                    </div>
                    <div class="toggle-switch">
                        <label class="switch">
                            <input type="checkbox" id="process-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-text">
                        <h3>Other Confirmations</h3>
                        <p>Show other confirmation dialogs</p>
                    </div>
                    <div class="toggle-switch">
                        <label class="switch">
                            <input type="checkbox" id="other-toggle" checked>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    /**
     * Clean up resources when the panel is closed
     */
    public dispose() {
        ConfirmationSettingsPanel.instance = undefined;

        // Dispose of the webview panel
        this.panel.dispose();

        // Dispose of all disposables
        while (this.disposables.length) {
            const disposable = this.disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}

/**
 * Generate a nonce for content security policy
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
