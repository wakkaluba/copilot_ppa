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
exports.RepositoryPanel = void 0;
const vscode = __importStar(require("vscode"));
const repositoryManagement_1 = require("../services/repositoryManagement");
class RepositoryPanel {
    static viewType = 'copilotPPA.repositoryPanel';
    _panel;
    _disposables = [];
    static createOrShow(extensionUri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(RepositoryPanel.viewType, 'Repository Management', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        });
        return new RepositoryPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this._panel = panel;
        // Set the webview's initial html content
        this._update(extensionUri);
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update(extensionUri);
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'createRepository':
                    try {
                        const repoUrl = await repositoryManagement_1.repositoryManager.createRepository(message.provider, message.name, message.description, message.isPrivate);
                        if (repoUrl) {
                            vscode.window.showInformationMessage(`Repository created: ${repoUrl}`);
                            this._panel.webview.postMessage({ command: 'repoCreated', url: repoUrl });
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to create repository: ${error.message}`);
                    }
                    return;
                case 'toggleRepositoryAccess':
                    repositoryManagement_1.repositoryManager.setEnabled(message.enabled);
                    vscode.window.showInformationMessage(`Repository access ${message.enabled ? 'enabled' : 'disabled'}`);
                    return;
            }
        }, null, this._disposables);
    }
    _update(extensionUri) {
        this._panel.title = 'Repository Management';
        this._panel.webview.html = this._getHtmlForWebview(extensionUri);
    }
    _getHtmlForWebview(extensionUri) {
        // Get the providers
        const providers = repositoryManagement_1.repositoryManager.getProviders();
        // Create HTML for providers
        const providersHtml = providers.map(provider => `
            <option value="${provider.name}">${provider.name}</option>
        `).join('');
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Repository Management</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                input, select, textarea {
                    width: 100%;
                    padding: 8px;
                    box-sizing: border-box;
                }
                button {
                    padding: 8px 16px;
                    cursor: pointer;
                }
                .toggle-container {
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                }
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                    margin-right: 10px;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #2196F3;
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
            </style>
        </head>
        <body>
            <h1>Repository Management</h1>
            
            <div class="toggle-container">
                <label class="toggle-switch">
                    <input type="checkbox" id="repoAccess" ${repositoryManagement_1.repositoryManager.isEnabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <span>Repository Access: ${repositoryManagement_1.repositoryManager.isEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>

            <div id="repoForm" ${!repositoryManagement_1.repositoryManager.isEnabled ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                <h2>Create Repository</h2>
                
                <div class="form-group">
                    <label for="provider">Provider:</label>
                    <select id="provider">
                        ${providersHtml}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="repoName">Repository Name:</label>
                    <input type="text" id="repoName" placeholder="my-awesome-project">
                </div>
                
                <div class="form-group">
                    <label for="repoDesc">Description:</label>
                    <textarea id="repoDesc" rows="3" placeholder="A project that does something amazing"></textarea>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="isPrivate" checked>
                        Private Repository
                    </label>
                </div>
                
                <button id="createRepo">Create Repository</button>
            </div>

            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    
                    // Handle toggle repository access
                    document.getElementById('repoAccess').addEventListener('change', (e) => {
                        const enabled = e.target.checked;
                        vscode.postMessage({
                            command: 'toggleRepositoryAccess',
                            enabled
                        });
                        
                        // Update UI
                        document.getElementById('repoForm').style.opacity = enabled ? '1' : '0.5';
                        document.getElementById('repoForm').style.pointerEvents = enabled ? 'auto' : 'none';
                    });
                    
                    // Handle create repository button
                    document.getElementById('createRepo').addEventListener('click', () => {
                        const provider = document.getElementById('provider').value;
                        const name = document.getElementById('repoName').value;
                        const description = document.getElementById('repoDesc').value;
                        const isPrivate = document.getElementById('isPrivate').checked;
                        
                        if (!name) {
                            alert('Repository name is required');
                            return;
                        }
                        
                        vscode.postMessage({
                            command: 'createRepository',
                            provider,
                            name,
                            description,
                            isPrivate
                        });
                    });
                    
                    // Handle message from extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        
                        switch (message.command) {
                            case 'repoCreated':
                                // Clear form
                                document.getElementById('repoName').value = '';
                                document.getElementById('repoDesc').value = '';
                                break;
                        }
                    });
                }());
            </script>
        </body>
        </html>`;
    }
    dispose() {
        // Clean up resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.RepositoryPanel = RepositoryPanel;
//# sourceMappingURL=repositoryPanel.js.map