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
exports.CopilotIntegrationPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const copilotApi_1 = require("../services/copilotApi");
const logger_1 = require("../utils/logger");
/**
 * Manages the UI component for Copilot integration
 */
class CopilotIntegrationPanel {
    static instance;
    panel;
    context;
    copilotApiService;
    logger;
    isLocalLLMActive = true;
    constructor(context) {
        this.context = context;
        this.copilotApiService = copilotApi_1.CopilotApiService.getInstance();
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Get singleton instance of CopilotIntegrationPanel
     */
    static getInstance(context) {
        if (!CopilotIntegrationPanel.instance) {
            CopilotIntegrationPanel.instance = new CopilotIntegrationPanel(context);
        }
        return CopilotIntegrationPanel.instance;
    }
    /**
     * Create and show the panel
     */
    async show() {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        if (this.panel) {
            this.panel.reveal(columnToShowIn);
            return;
        }
        // Create a new panel
        this.panel = vscode.window.createWebviewPanel('copilotIntegration', 'Copilot Integration', columnToShowIn || vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'media'))
            ]
        });
        // Initialize Copilot API connection
        const isConnected = await this.copilotApiService.initialize();
        // Set initial HTML content
        this.updateWebviewContent(isConnected);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'toggleLLMMode':
                    this.isLocalLLMActive = !this.isLocalLLMActive;
                    this.updateWebviewContent(isConnected);
                    break;
                case 'sendMessage':
                    await this.handleMessageSend(message.text);
                    break;
                case 'reconnectCopilot':
                    const reconnected = await this.copilotApiService.initialize();
                    this.updateWebviewContent(reconnected);
                    break;
            }
        }, undefined, this.context.subscriptions);
        // Reset when the panel is disposed
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.context.subscriptions);
    }
    /**
     * Update the webview content
     */
    updateWebviewContent(isCopilotConnected) {
        if (!this.panel) {
            return;
        }
        // Get the path to the CSS file
        const stylesPath = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'styles.css'));
        // And the URI we'll use to load it
        const stylesUri = this.panel.webview.asWebviewUri(stylesPath);
        // Create the toggle button state
        const toggleState = this.isLocalLLMActive
            ? { label: 'Using Local LLM', class: 'local-llm-active' }
            : { label: 'Using GitHub Copilot', class: 'copilot-active' };
        // Create connection status message
        const copilotStatus = isCopilotConnected
            ? '<span class="status-connected">Copilot Connected</span>'
            : '<span class="status-disconnected">Copilot Disconnected</span>';
        this.panel.webview.html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Local LLM & Copilot Integration</title>
                <link href="${stylesUri}" rel="stylesheet">
                <style>
                    .container {
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                    }
                    .toggle-container {
                        display: flex;
                        align-items: center;
                    }
                    .toggle-switch {
                        position: relative;
                        display: inline-block;
                        width: 60px;
                        height: 34px;
                        margin: 0 10px;
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
                    .status {
                        font-size: 14px;
                        margin-top: 5px;
                    }
                    .status-connected {
                        color: #4CAF50;
                    }
                    .status-disconnected {
                        color: #F44336;
                    }
                    .chat-container {
                        flex: 1;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        padding: 10px;
                        overflow-y: auto;
                        margin-bottom: 20px;
                    }
                    .input-container {
                        display: flex;
                    }
                    #messageInput {
                        flex: 1;
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        margin-right: 10px;
                    }
                    button {
                        padding: 10px 15px;
                        background-color: #0078D4;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    button:hover {
                        background-color: #005a9e;
                    }
                    .local-llm-active {
                        color: #4CAF50;
                    }
                    .copilot-active {
                        color: #9c27b0;
                    }
                    .message {
                        margin-bottom: 10px;
                        padding: 10px;
                        border-radius: 5px;
                    }
                    .user-message {
                        background-color: #E3F2FD;
                        align-self: flex-end;
                    }
                    .assistant-message {
                        background-color: #F5F5F5;
                        align-self: flex-start;
                    }
                    .reconnect-container {
                        display: ${isCopilotConnected ? 'none' : 'block'};
                        margin-top: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>AI Assistant</h2>
                        <div class="toggle-container">
                            <span class="${toggleState.class}">${toggleState.label}</span>
                            <label class="toggle-switch">
                                <input type="checkbox" ${this.isLocalLLMActive ? '' : 'checked'} id="llmToggle">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="status">
                        ${copilotStatus}
                        <div class="reconnect-container">
                            <button id="reconnectButton">Reconnect to Copilot</button>
                        </div>
                    </div>
                    
                    <div class="chat-container" id="chatContainer">
                        <!-- Chat messages will be displayed here -->
                    </div>
                    
                    <div class="input-container">
                        <input type="text" id="messageInput" placeholder="Type your message...">
                        <button id="sendButton">Send</button>
                    </div>
                </div>
                
                <script>
                    const vscode = acquireVsCodeApi();
                    const chatContainer = document.getElementById('chatContainer');
                    const messageInput = document.getElementById('messageInput');
                    const sendButton = document.getElementById('sendButton');
                    const llmToggle = document.getElementById('llmToggle');
                    const reconnectButton = document.getElementById('reconnectButton');
                    
                    // Send a message
                    function sendMessage() {
                        const text = messageInput.value.trim();
                        if (text) {
                            // Add user message to chat
                            addMessageToChat('user', text);
                            
                            // Send to extension
                            vscode.postMessage({
                                command: 'sendMessage',
                                text: text
                            });
                            
                            // Clear input
                            messageInput.value = '';
                        }
                    }
                    
                    // Add a message to the chat display
                    function addMessageToChat(role, text) {
                        const messageElement = document.createElement('div');
                        messageElement.classList.add('message');
                        messageElement.classList.add(role === 'user' ? 'user-message' : 'assistant-message');
                        messageElement.textContent = text;
                        chatContainer.appendChild(messageElement);
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                    }
                    
                    // Event listeners
                    sendButton.addEventListener('click', sendMessage);
                    
                    messageInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    });
                    
                    llmToggle.addEventListener('change', () => {
                        vscode.postMessage({
                            command: 'toggleLLMMode'
                        });
                    });
                    
                    reconnectButton.addEventListener('click', () => {
                        vscode.postMessage({
                            command: 'reconnectCopilot'
                        });
                    });
                    
                    // Handle messages sent from the extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.command) {
                            case 'addResponse':
                                addMessageToChat('assistant', message.text);
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
    /**
     * Handle sending a message through the appropriate API
     */
    async handleMessageSend(text) {
        try {
            let response;
            if (this.isLocalLLMActive) {
                // Use local LLM service here
                // This is a placeholder - you should replace with your actual LLM service call
                response = "This is a placeholder response from the local LLM. Implement the actual LLM service call here.";
            }
            else {
                // Use Copilot API
                response = await this.copilotApiService.sendChatRequest(text);
            }
            // Send the response back to the webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'addResponse',
                    text: response
                });
            }
        }
        catch (error) {
            this.logger.error('Error processing message', error);
            // Send error message to webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'addResponse',
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`
                });
            }
        }
    }
}
exports.CopilotIntegrationPanel = CopilotIntegrationPanel;
//# sourceMappingURL=copilotIntegrationPanel.js.map