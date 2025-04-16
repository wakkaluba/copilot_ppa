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
exports.AgentSidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
const connectionStatusService_1 = require("../status/connectionStatusService");
/**
 * Provides the sidebar view for the Local LLM Agent
 */
class AgentSidebarProvider {
    constructor(_extensionUri, _llmProviderManager, connectionStatusService) {
        this._extensionUri = _extensionUri;
        this._llmProviderManager = _llmProviderManager;
        this._disposables = [];
        this._connectionStatusService = connectionStatusService;
        // Listen for connection status changes
        this._disposables.push(this._connectionStatusService.onDidChangeState(state => {
            this._updateSidebarView();
        }));
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getWebviewContent(webviewView.webview);
        // Handle messages from the webview
        this._registerWebviewMessageHandlers(webviewView);
        // Update the view when it becomes visible
        if (webviewView.visible) {
            this._updateSidebarView();
        }
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this._updateSidebarView();
            }
        });
    }
    /**
     * Registers message handlers for webview communication
     */
    _registerWebviewMessageHandlers(webviewView) {
        this._disposables.push(webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'selectModel':
                    await this._selectModel(data.model);
                    break;
                case 'connectLlm':
                    await this._connectToLlm();
                    break;
                case 'disconnectLlm':
                    await this._disconnectFromLlm();
                    break;
                case 'refreshModels':
                    await this._refreshModels();
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('workbench.action.openSettings', 'localLlmAgent');
                    break;
            }
        }));
    }
    /**
     * Handle model selection
     */
    async _selectModel(modelName) {
        try {
            await this._llmProviderManager.setActiveModel(modelName);
            this._updateSidebarView();
            vscode.window.showInformationMessage(`Model set to: ${modelName}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to set model: ${errorMessage}`);
        }
    }
    /**
     * Handle connecting to LLM
     */
    async _connectToLlm() {
        try {
            this._view?.webview.postMessage({ type: 'updateStatus', status: 'Connecting...' });
            await this._llmProviderManager.connect();
            this._updateSidebarView();
            vscode.window.showInformationMessage('Connected to LLM provider');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to connect: ${errorMessage}`);
            this._updateSidebarView();
        }
    }
    /**
     * Handle disconnecting from LLM
     */
    async _disconnectFromLlm() {
        try {
            await this._llmProviderManager.disconnect();
            this._updateSidebarView();
            vscode.window.showInformationMessage('Disconnected from LLM provider');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to disconnect: ${errorMessage}`);
        }
    }
    /**
     * Handle refreshing model list
     */
    async _refreshModels() {
        try {
            this._view?.webview.postMessage({ type: 'updateStatus', status: 'Refreshing models...' });
            await this._llmProviderManager.refreshModels();
            this._updateSidebarView();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to refresh models: ${errorMessage}`);
            this._updateSidebarView();
        }
    }
    /**
     * Update the sidebar view with current state
     */
    _updateSidebarView() {
        if (!this._view) {
            return;
        }
        const provider = this._llmProviderManager.getActiveProvider();
        const connectionState = this._connectionStatusService.state;
        const isConnected = connectionState === connectionStatusService_1.ConnectionState.Connected;
        const activeModel = this._connectionStatusService.activeModelName || '';
        const availableModels = this._llmProviderManager.getAvailableModels() || [];
        const providerType = this._connectionStatusService.providerName || 'None';
        this._view.webview.postMessage({
            type: 'updateState',
            state: {
                isConnected,
                connectionState: connectionState,
                activeModel,
                availableModels,
                providerType
            }
        });
        this._view.webview.postMessage({
            type: 'updateStatus',
            status: connectionState === connectionStatusService_1.ConnectionState.Connecting ? 'Connecting...' : ''
        });
    }
    /**
     * Generates the HTML content for the webview
     */
    _getWebviewContent(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.css'));
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesUri}" rel="stylesheet">
                <link href="${codiconsUri}" rel="stylesheet">
                <title>Local LLM Agent</title>
            </head>
            <body>
                <div id="sidebar-container">
                    <div id="status-container">
                        <h3>Local LLM Agent</h3>
                        <div id="connection-status">
                            <span id="status-indicator"></span>
                            <span id="status-text">Disconnected</span>
                        </div>
                        <div id="status-message"></div>
                    </div>
                    
                    <div id="model-section">
                        <h4>LLM Model</h4>
                        <div id="model-selector-container">
                            <select id="model-selector" disabled>
                                <option value="">Select a model</option>
                            </select>
                            <button id="refresh-models-button" title="Refresh models">
                                <i class="codicon codicon-refresh"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="connection-section">
                        <button id="connect-button" class="wide-button">
                            <i class="codicon codicon-plug"></i> Connect
                        </button>
                        <button id="disconnect-button" class="wide-button hidden">
                            <i class="codicon codicon-debug-disconnect"></i> Disconnect
                        </button>
                    </div>
                    
                    <div id="actions-section">
                        <h4>Actions</h4>
                        <button id="open-chat-button" class="wide-button">
                            <i class="codicon codicon-comment"></i> Open Chat
                        </button>
                        <button id="settings-button" class="wide-button">
                            <i class="codicon codicon-gear"></i> Settings
                        </button>
                    </div>
                    
                    <div id="info-section">
                        <h4>Provider Information</h4>
                        <div id="provider-details">
                            <div><strong>Type:</strong> <span id="provider-type">None</span></div>
                            <div><strong>Model:</strong> <span id="active-model">None</span></div>
                        </div>
                    </div>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
exports.AgentSidebarProvider = AgentSidebarProvider;
AgentSidebarProvider.viewType = 'localLlmAgent.sidebarView';
//# sourceMappingURL=agentSidebarProvider.js.map