import * as vscode from 'vscode';
import { getKeybindingManager } from '../services/ui/keybindingManager';

/**
 * WebviewViewProvider for displaying keyboard shortcuts in the sidebar
 */
export class KeyboardShortcutsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'copilotPPA.keyboardShortcutsView';
    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    /**
     * Set up the webview HTML and message handlers
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.command) {
                case 'getKeybindings':
                    this._loadKeybindings();
                    break;

                case 'openSettings':
                    vscode.commands.executeCommand('copilotPPA.openUISettingsPanel', 'keybindings');
                    break;

                case 'editKeybinding':
                    this._editKeybinding(data.id);
                    break;
            }
        });

        // Initial load
        this._loadKeybindings();
    }

    /**
     * Load and display keybindings in the webview
     */
    private _loadKeybindings() {
        if (!this._view) {
            return;
        }

        const keybindingManager = getKeybindingManager();
        const keybindings = keybindingManager.getKeybindings();

        this._view.webview.postMessage({
            command: 'keybindingsLoaded',
            keybindings
        });
    }

    /**
     * Handle editing a keybinding
     */
    private async _editKeybinding(id: string) {
        const keybindingManager = getKeybindingManager();
        const keybinding = keybindingManager.getKeybinding(id);

        if (!keybinding) {
            return;
        }

        const newKey = await vscode.window.showInputBox({
            prompt: `Enter new keybinding for "${keybinding.description}"`,
            value: keybinding.key,
            placeHolder: 'e.g., Ctrl+Shift+P'
        });

        if (newKey && newKey !== keybinding.key) {
            keybindingManager.updateKeybinding(id, newKey);
            vscode.window.showInformationMessage(`Keybinding updated for ${keybinding.description}`);
            this._loadKeybindings();
        }
    }

    /**
     * Generate the webview HTML
     */
    private _getHtmlForWebview(_webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Keyboard Shortcuts</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 10px;
                    color: var(--vscode-foreground);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .title {
                    font-size: 16px;
                    font-weight: bold;
                }
                .settings-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 4px 8px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                .settings-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .keybinding-list {
                    width: 100%;
                }
                .keybinding-item {
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .keybinding-item:last-child {
                    border-bottom: none;
                }
                .keybinding-info {
                    flex: 1;
                }
                .keybinding-desc {
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                .keybinding-when {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-top: 2px;
                }
                .keybinding-key {
                    display: inline-flex;
                    background: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: monospace;
                    margin-right: 5px;
                    align-items: center;
                }
                .keybinding-edit {
                    margin-left: 10px;
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                    cursor: pointer;
                    font-size: 12px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .keybinding-item:hover .keybinding-edit {
                    opacity: 1;
                }
                .keybinding-edit:hover {
                    text-decoration: underline;
                }
                .category {
                    margin-top: 20px;
                    margin-bottom: 10px;
                    font-weight: bold;
                    color: var(--vscode-descriptionForeground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 5px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">Keyboard Shortcuts</div>
                <button class="settings-btn" id="settingsBtn">Customize</button>
            </div>

            <div id="keybindingList">
                <div style="text-align: center;">Loading...</div>
            </div>

            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    const keybindingList = document.getElementById('keybindingList');
                    const settingsBtn = document.getElementById('settingsBtn');

                    // Request keybindings
                    vscode.postMessage({ command: 'getKeybindings' });

                    // Handle settings button
                    settingsBtn.addEventListener('click', () => {
                        vscode.postMessage({ command: 'openSettings' });
                    });

                    // Handle messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;

                        switch (message.command) {
                            case 'keybindingsLoaded':
                                renderKeybindings(message.keybindings);
                                break;
                        }
                    });

                    // Render keybindings grouped by category
                    function renderKeybindings(keybindings) {
                        keybindingList.innerHTML = '';

                        // Use the categories from KeybindingCategory enum
                        const categories = {
                            [KeybindingCategory.Chat]: [],
                            [KeybindingCategory.Code]: [],
                            [KeybindingCategory.Navigation]: [],
                            [KeybindingCategory.Other]: []
                        };

                        // Group by category
                        keybindings.forEach(binding => {
                            categories[binding.category].push(binding);
                        });

                        // Remove empty categories and render
                        Object.entries(categories)
                            .filter(([_, bindings]) => bindings.length > 0)
                            .forEach(([category, bindings]) => {
                                const categoryEl = document.createElement('div');
                                categoryEl.className = 'category';
                                categoryEl.textContent = category;
                                keybindingList.appendChild(categoryEl);

                                bindings.forEach(binding => {
                                    const item = document.createElement('div');
                                    item.className = 'keybinding-item';

                                    const info = document.createElement('div');
                                    info.className = 'keybinding-info';

                                    const desc = document.createElement('div');
                                    desc.className = 'keybinding-desc';
                                    desc.textContent = binding.description;
                                    info.appendChild(desc);

                                    if (binding.when) {
                                        const when = document.createElement('div');
                                        when.className = 'keybinding-when';
                                        when.textContent = \`When: \${binding.when}\`;
                                        info.appendChild(when);
                                    }

                                    const controls = document.createElement('div');
                                    controls.style.display = 'flex';
                                    controls.style.alignItems = 'center';

                                    const keyEl = document.createElement('span');
                                    keyEl.className = 'keybinding-key';
                                    keyEl.textContent = binding.key;

                                    const editLink = document.createElement('a');
                                    editLink.className = 'keybinding-edit';
                                    editLink.textContent = 'Edit';
                                    editLink.addEventListener('click', () => {
                                        vscode.postMessage({
                                            command: 'editKeybinding',
                                            id: binding.id
                                        });
                                    });

                                    controls.appendChild(keyEl);
                                    controls.appendChild(editLink);

                                    item.appendChild(info);
                                    item.appendChild(controls);
                                    keybindingList.appendChild(item);
                                });
                            });
                    }
                })();
            </script>
        </body>
        </html>`;
    }
}
