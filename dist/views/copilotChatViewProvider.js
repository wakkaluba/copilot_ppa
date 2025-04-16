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
exports.CopilotChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const copilotChatIntegration_1 = require("../copilot/copilotChatIntegration");
const logger_1 = require("../utils/logger");
/**
 * Provides a custom view that integrates with Copilot Chat
 */
class CopilotChatViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this.copilotChatIntegration = copilotChatIntegration_1.CopilotChatIntegration.getInstance();
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Resolves the webview view
     */
    async resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Initialize Copilot chat integration
        const isInitialized = await this.copilotChatIntegration.initialize();
        this._updateStatus(isInitialized);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'sendMessage':
                    await this._handleSendMessage(message.text);
                    break;
                case 'reconnect':
                    const reconnected = await this.copilotChatIntegration.initialize();
                    this._updateStatus(reconnected);
                    break;
                case 'toggleIntegration':
                    const isActive = this.copilotChatIntegration.toggleIntegration();
                    this._updateStatus(isActive);
                    break;
            }
        });
    }
    /**
     * Update integration status in the webview
     */
    _updateStatus(isActive) {
        if (this._view) {
            this._view.webview.postMessage({
                command: 'updateStatus',
                isActive: isActive
            });
        }
    }
    /**
     * Handle sending a message to Copilot chat
     */
    async _handleSendMessage(text) {
        if (!text.trim()) {
            return;
        }
        try {
            // Send message to Copilot chat
            const success = await this.copilotChatIntegration.sendMessageToCopilotChat(text);
            if (!success) {
                if (this._view) {
                    this._view.webview.postMessage({
                        command: 'showError',
                        text: 'Failed to send message to Copilot. Check integration status.'
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Error sending message to Copilot chat', error);
            if (this._view) {
                this._view.webview.postMessage({
                    command: 'showError',
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`
                });
            }
        }
    }
    /**
     * Generate HTML for the webview
     */
    _getHtmlForWebview(webview) {
        // Get path to stylesheet
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css'));
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleUri}" rel="stylesheet">
            <title>Copilot Chat Integration</title>
            <style>
                body {
                    padding: 10px;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .status-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding: 5px;
                    background-color: var(--vscode-editor-background);
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .status-indicator {
                    display: flex;
                    align-items: center;
                }
                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    margin-right: 5px;
                }
                .status-active {
                    background-color: #4CAF50;
                }
                .status-inactive {
                    background-color: #F44336;
                }
                .message-container {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 10px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 5px;
                    padding: 10px;
                }
                .message {
                    margin-bottom: 8px;
                    padding: 8px;
                    border-radius: 5px;
                }
                .message-input {
                    display: flex;
                }
                input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 5px;
                    margin-right: 8px;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                }
                button {
                    padding: 8px 12px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .error {
                    color: #F44336;
                    margin: 5px 0;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="status-bar">
                    <div class="status-indicator">
                        <div class="status-dot status-inactive" id="statusDot"></div>
                        <span id="statusText">Integration Inactive</span>
                    </div>
                    <div>
                        <button id="toggleIntegration">Toggle</button>
                        <button id="reconnectButton">Reconnect</button>
                    </div>
                </div>
                
                <div class="message-container" id="messageContainer">
                    <div class="message">
                        Welcome to the Copilot Chat Integration. Messages sent from here will appear in the Copilot chat window.
                    </div>
                </div>
                
                <div id="errorContainer" class="error" style="display: none;"></div>
                
                <div class="message-input">
                    <input type="text" id="messageInput" placeholder="Type message to send to Copilot Chat..." />
                    <button id="sendButton">Send</button>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                const messageInput = document.getElementById('messageInput');
                const sendButton = document.getElementById('sendButton');
                const statusDot = document.getElementById('statusDot');
                const statusText = document.getElementById('statusText');
                const toggleButton = document.getElementById('toggleIntegration');
                const reconnectButton = document.getElementById('reconnectButton');
                const errorContainer = document.getElementById('errorContainer');
                
                // Send message
                function sendMessage() {
                    const text = messageInput.value.trim();
                    if (text) {
                        vscode.postMessage({
                            command: 'sendMessage',
                            text: text
                        });
                        
                        // Clear input
                        messageInput.value = '';
                    }
                }
                
                // Update status indicator
                function updateStatus(active) {
                    if (active) {
                        statusDot.classList.remove('status-inactive');
                        statusDot.classList.add('status-active');
                        statusText.textContent = 'Integration Active';
                    } else {
                        statusDot.classList.remove('status-active');
                        statusDot.classList.add('status-inactive');
                        statusText.textContent = 'Integration Inactive';
                    }
                }
                
                // Show error message
                function showError(message) {
                    errorContainer.textContent = message;
                    errorContainer.style.display = 'block';
                    setTimeout(() => {
                        errorContainer.style.display = 'none';
                    }, 5000);
                }
                
                // Event listeners
                sendButton.addEventListener('click', sendMessage);
                
                messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendMessage();
                    }
                });
                
                toggleButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'toggleIntegration'
                    });
                });
                
                reconnectButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'reconnect'
                    });
                });
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'updateStatus':
                            updateStatus(message.isActive);
                            break;
                            
                        case 'showError':
                            showError(message.text);
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }
}
exports.CopilotChatViewProvider = CopilotChatViewProvider;
CopilotChatViewProvider.viewType = 'localLlmAgent.copilotChatView';
//# sourceMappingURL=copilotChatViewProvider.js.map