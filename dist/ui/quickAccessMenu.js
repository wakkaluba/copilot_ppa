"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickAccessMenu = void 0;
const vscode = __importStar(require("vscode"));
const commandToggleManager_1 = require("./commandToggleManager");
/**
 * Provides a burger menu with quick access to command toggles
 */
class QuickAccessMenu {
    panel;
    context;
    toggleManager;
    constructor(context) {
        this.context = context;
        this.toggleManager = commandToggleManager_1.CommandToggleManager.getInstance(context);
        // Listen for toggle changes to update UI if open
        this.toggleManager.onToggleChange(() => {
            if (this.panel) {
                this.updatePanel();
            }
        });
    }
    /**
     * Show the quick access menu
     */
    show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        // Create a new panel
        this.panel = vscode.window.createWebviewPanel('quickAccessMenu', 'Command Toggles', { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [this.context.extensionUri]
        });
        // Set initial content
        this.updatePanel();
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(async (message) => {
            await this.handleWebviewMessage(message);
        }, null, this.context.subscriptions);
        // Clean up resources when the panel is closed
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.context.subscriptions);
    }
    /**
     * Update the panel content
     */
    updatePanel() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.html = this.getWebviewContent();
    }
    /**
     * Handle messages from the webview
     */
    async handleWebviewMessage(message) {
        switch (message.command) {
            case 'toggleSwitch':
                await this.toggleManager.toggleState(message.id);
                break;
            case 'resetAll':
                await this.toggleManager.resetToggles();
                break;
            case 'close':
                if (this.panel) {
                    this.panel.dispose();
                }
                break;
        }
    }
    /**
     * Generate the webview HTML content
     */
    getWebviewContent() {
        const nonce = this.getNonce();
        const toggles = this.toggleManager.getAllToggles();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <title>Command Toggles</title>
            <style>
                body {
                    padding: 0;
                    margin: 0;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                h2 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .close-button {
                    background: none;
                    border: none;
                    color: var(--vscode-foreground);
                    cursor: pointer;
                    font-size: 16px;
                    opacity: 0.7;
                }
                
                .close-button:hover {
                    opacity: 1;
                }
                
                .toggle-list {
                    margin-bottom: 20px;
                }
                
                .toggle-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 10px;
                    margin-bottom: 8px;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-radius: 4px;
                }
                
                .toggle-info {
                    flex: 1;
                }
                
                .toggle-label {
                    display: flex;
                    align-items: center;
                    margin-bottom: 4px;
                    font-weight: bold;
                }
                
                .tag {
                    display: inline-block;
                    padding: 2px 8px;
                    margin-right: 8px;
                    border-radius: 16px;
                    font-size: 12px;
                    font-weight: normal;
                    color: var(--vscode-badge-foreground);
                    background-color: var(--vscode-badge-background);
                }
                
                .toggle-description {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                }
                
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 40px;
                    height: 20px;
                    flex-shrink: 0;
                }
                
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--vscode-input-background);
                    transition: .3s;
                    border-radius: 34px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 16px;
                    width: 16px;
                    left: 2px;
                    bottom: 2px;
                    background-color: var(--vscode-input-foreground);
                    transition: .3s;
                    border-radius: 50%;
                }
                
                input:checked + .toggle-slider {
                    background-color: var(--vscode-button-background);
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(20px);
                }
                
                .actions {
                    text-align: center;
                }
                
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    cursor: pointer;
                    border-radius: 2px;
                    margin-top: 10px;
                }
                
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .helper-text {
                    margin-top: 20px;
                    padding: 10px;
                    font-size: 12px;
                    line-height: 1.4;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-radius: 4px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>
                    <span>Command Toggles</span>
                    <button class="close-button" id="close-button">✕</button>
                </h2>
                
                <div class="toggle-list">
                    ${toggles.map(toggle => `
                        <div class="toggle-item">
                            <div class="toggle-info">
                                <div class="toggle-label">
                                    <span class="tag">${toggle.label}</span>
                                    <span>${toggle.id}</span>
                                </div>
                                <div class="toggle-description">${toggle.description}</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox" id="toggle-${toggle.id}" ${toggle.state ? 'checked' : ''}>
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    `).join('')}
                </div>
                
                <div class="actions">
                    <button id="reset-button">Reset All</button>
                </div>
                
                <div class="helper-text">
                    <p>These toggles control the behavior of commands sent to the AI assistant. When enabled, they will automatically be added to your messages.</p>
                    <p>Example: With @workspace enabled, the assistant will have access to your workspace files.</p>
                </div>
            </div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                // Handle toggle switches
                document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', () => {
                        const id = checkbox.id.replace('toggle-', '');
                        vscode.postMessage({
                            command: 'toggleSwitch',
                            id: id
                        });
                    });
                });
                
                // Handle reset button
                document.getElementById('reset-button').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'resetAll'
                    });
                });
                
                // Handle close button
                document.getElementById('close-button').addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'close'
                    });
                });
            </script>
        </body>
        </html>`;
    }
    /**
     * Generate a nonce for content security policy
     */
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
exports.QuickAccessMenu = QuickAccessMenu;
//# sourceMappingURL=quickAccessMenu.js.map