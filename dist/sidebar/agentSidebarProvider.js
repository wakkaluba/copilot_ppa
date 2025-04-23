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
const fs = __importStar(require("fs"));
/**
 * Provides the agent sidebar webview implementation
 */
class AgentSidebarProvider {
    _extensionUri;
    _connectionManager;
    static viewType = 'copilot-ppa.agentSidebar';
    _view;
    _messageHandlers;
    _disposables = [];
    constructor(_extensionUri, _connectionManager) {
        this._extensionUri = _extensionUri;
        this._connectionManager = _connectionManager;
        this._messageHandlers = new Map();
        this.registerMessageHandlers();
        this.listenToConnectionChanges();
    }
    /**
     * Resolves the webview view
     */
    resolveWebviewView(webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlContent(webviewView.webview);
        this.setupMessageListener(webviewView.webview);
        this.updateConnectionState();
    }
    /**
     * Sets up the message listener for webview communication
     */
    setupMessageListener(webview) {
        this._disposables.push(webview.onDidReceiveMessage(async (message) => {
            const handler = this._messageHandlers.get(message.type);
            if (handler) {
                try {
                    await handler(message.data);
                }
                catch (error) {
                    console.error(`Error handling message ${message.type}:`, error);
                    this.showError(`Failed to handle ${message.type}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            else {
                console.warn(`No handler registered for message type: ${message.type}`);
            }
        }));
    }
    /**
     * Registers all message handlers for webview communication
     */
    registerMessageHandlers() {
        this._messageHandlers.set('connect', async () => {
            try {
                await this._connectionManager.connect();
                this.updateConnectionState();
            }
            catch (error) {
                this.showError(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
        this._messageHandlers.set('disconnect', async () => {
            try {
                await this._connectionManager.disconnect();
                this.updateConnectionState();
            }
            catch (error) {
                this.showError(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
        this._messageHandlers.set('refreshModels', async () => {
            try {
                const models = await this._connectionManager.getAvailableModels();
                await this._view?.webview.postMessage({
                    type: 'updateModels',
                    data: models
                });
            }
            catch (error) {
                this.showError(`Failed to refresh models: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
        this._messageHandlers.set('setModel', async (modelId) => {
            try {
                await this._connectionManager.setModel(modelId);
                this.updateConnectionState();
            }
            catch (error) {
                this.showError(`Failed to set model: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
    }
    /**
     * Listens to connection state changes
     */
    listenToConnectionChanges() {
        this._disposables.push(this._connectionManager.onConnectionStateChanged(() => {
            this.updateConnectionState();
        }));
    }
    /**
     * Updates the connection state in the webview
     */
    async updateConnectionState() {
        if (!this._view)
            return;
        const state = this._connectionManager.getConnectionState();
        const currentModel = this._connectionManager.getCurrentModel();
        await this._view.webview.postMessage({
            type: 'updateState',
            data: {
                connected: state.isConnected,
                model: currentModel,
                models: await this._connectionManager.getAvailableModels()
            }
        });
    }
    /**
     * Shows an error message in the webview
     */
    async showError(message) {
        if (!this._view)
            return;
        await this._view.webview.postMessage({
            type: 'showError',
            data: message
        });
    }
    /**
     * Gets the HTML content for the webview
     */
    _getHtmlContent(webview) {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'agent-sidebar.html');
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'agent-sidebar.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
        const nonce = this.generateNonce();
        const htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');
        return htmlContent
            .replace('${webview.cspSource}', webview.cspSource)
            .replace('${styleUri}', styleUri.toString())
            .replace('${scriptUri}', scriptUri.toString())
            .replace('${nonce}', nonce);
    }
    /**
     * Generates a nonce for Content Security Policy
     */
    generateNonce() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
    /**
     * Cleans up resources
     */
    dispose() {
        this._disposables.forEach(d => d.dispose());
        this._messageHandlers.clear();
        this._view = undefined;
    }
}
exports.AgentSidebarProvider = AgentSidebarProvider;
//# sourceMappingURL=agentSidebarProvider.js.map