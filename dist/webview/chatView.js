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
exports.ChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const connectionStatusService_1 = require("../status/connectionStatusService");
/**
 * Manages the chat interface webview panel
 */
class ChatViewProvider {
    constructor(_extensionUri, _llmProviderManager, connectionStatusService) {
        this._extensionUri = _extensionUri;
        this._llmProviderManager = _llmProviderManager;
        this._messages = [];
        this._disposables = [];
        this._connectionStatusService = connectionStatusService;
        // Listen for connection status changes
        this._disposables.push(this._connectionStatusService.onDidChangeState(state => {
            this._updateConnectionStatus(state);
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
        this._disposables.push(webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this._handleUserMessage(data.message);
                    break;
                case 'clearChat':
                    this._messages = [];
                    this._updateChatView();
                    break;
            }
        }));
        // Update the view when it becomes visible
        if (webviewView.visible) {
            this._updateChatView();
        }
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this._updateChatView();
            }
        });
    }
    /**
     * Handles a user message, adds it to the chat, and gets a response from the LLM
     */
    async _handleUserMessage(content) {
        if (!content.trim()) {
            return;
        }
        // Add user message
        const userMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: content,
            timestamp: Date.now()
        };
        this._messages.push(userMessage);
        this._updateChatView();
        try {
            // Show loading state
            this._view?.webview.postMessage({
                type: 'updateStatus',
                status: 'Thinking...'
            });
            // Get response from LLM
            const activeProvider = this._llmProviderManager.getActiveProvider();
            if (!activeProvider) {
                throw new Error('No active LLM provider');
            }
            const response = await activeProvider.generateCompletion(content, {
                conversation: this._messages.map(m => ({ role: m.role, content: m.content }))
            });
            // Add assistant response
            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            this._messages.push(assistantMessage);
            // Clear loading state and update view
            this._view?.webview.postMessage({ type: 'updateStatus', status: '' });
            this._updateChatView();
        }
        catch (error) {
            // Handle error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `Error: ${errorMessage}`,
                timestamp: Date.now()
            };
            this._messages.push(assistantMessage);
            this._view?.webview.postMessage({ type: 'updateStatus', status: '' });
            this._updateChatView();
            vscode.window.showErrorMessage(`LLM Error: ${errorMessage}`);
        }
    }
    /**
     * Update the chat view with the current messages
     */
    _updateChatView() {
        if (this._view) {
            this._view.webview.postMessage({
                type: 'updateMessages',
                messages: this._messages
            });
        }
    }
    /**
     * Generates the HTML content for the webview
     */
    _getWebviewContent(webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.js'));
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.css'));
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
                <div id="chat-container">
                    <div id="messages-container"></div>
                    <div id="status-bar"></div>
                    <div id="input-container">
                        <div id="message-input-container">
                            <textarea id="message-input" placeholder="Ask a question..." rows="1"></textarea>
                        </div>
                        <div id="button-container">
                            <button id="send-button" title="Send message">
                                <i class="codicon codicon-send"></i>
                            </button>
                            <button id="clear-button" title="Clear chat">
                                <i class="codicon codicon-clear-all"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <script src="${scriptUri}"></script>
            </body>
            </html>`;
    }
    /**
     * Update connection status in the chat view
     */
    _updateConnectionStatus(state) {
        if (!this._view) {
            return;
        }
        const statusMessage = this._getStatusMessage(state);
        const isDisabled = state !== connectionStatusService_1.ConnectionState.Connected;
        this._view.webview.postMessage({
            type: 'updateConnectionStatus',
            status: {
                state: state,
                message: statusMessage,
                isInputDisabled: isDisabled
            }
        });
    }
    /**
     * Get appropriate status message based on connection state
     */
    _getStatusMessage(state) {
        switch (state) {
            case connectionStatusService_1.ConnectionState.Connected:
                const modelName = this._connectionStatusService.activeModelName;
                return modelName ? `Connected to ${modelName}` : 'Connected to LLM';
            case connectionStatusService_1.ConnectionState.Connecting:
                return 'Connecting to LLM...';
            case connectionStatusService_1.ConnectionState.Error:
                return 'Error connecting to LLM';
            case connectionStatusService_1.ConnectionState.Disconnected:
            default:
                return 'Not connected to LLM';
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
exports.ChatViewProvider = ChatViewProvider;
ChatViewProvider.viewType = 'localLlmAgent.chatView';
//# sourceMappingURL=chatView.js.map