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
exports.CopilotIntegrationWebview = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * WebView implementation for Copilot integration UI
 */
class CopilotIntegrationWebview {
    context;
    static viewType = 'copilotIntegration.webview';
    panel;
    extensionPath;
    copilotService;
    disposables = [];
    /**
     * Creates a new instance of the CopilotIntegrationWebview
     * @param context The extension context
     * @param copilotService The Copilot integration service
     */
    constructor(context, copilotService) {
        this.context = context;
        this.extensionPath = context.extensionPath;
        this.copilotService = copilotService;
    }
    /**
     * Creates and shows the webview panel
     */
    async show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        // Create the webview panel
        this.panel = vscode.window.createWebviewPanel(CopilotIntegrationWebview.viewType, 'Copilot Integration', vscode.ViewColumn.Beside, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.extensionPath, 'media'))
            ],
            retainContextWhenHidden: true
        });
        // Set the HTML content
        this.panel.webview.html = this.getWebviewContent();
        // Set up message handling
        this.setupMessageHandling();
        // Handle panel disposal
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    }
    /**
     * Sets up message handling for the webview
     */
    setupMessageHandling() {
        if (!this.panel) {
            return;
        }
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'sendPrompt':
                    this.handleSendPrompt(message.text);
                    break;
                case 'toggleProvider':
                    this.handleToggleProvider(message.provider);
                    break;
                case 'clearChat':
                    this.handleClearChat();
                    break;
            }
        }, null, this.disposables);
        // Register for Copilot responses
        this.copilotService.registerChatResponseCallback((response) => {
            this.sendMessageToWebview({
                command: 'addResponse',
                text: response,
                source: 'copilot'
            });
        });
    }
    /**
     * Handles sending a prompt to Copilot
     * @param text The text to send
     */
    async handleSendPrompt(text) {
        try {
            // Add the user message to the UI
            this.sendMessageToWebview({
                command: 'addMessage',
                text,
                source: 'user'
            });
            // Show a loading indicator
            this.sendMessageToWebview({ command: 'setLoading', isLoading: true });
            // Forward the message to Copilot
            const response = await this.copilotService.sendPrompt({
                prompt: text,
                options: {
                    temperature: 0.7,
                    maxTokens: 800
                }
            });
            // Hide the loading indicator
            this.sendMessageToWebview({ command: 'setLoading', isLoading: false });
            if (response) {
                // Add the response to the UI
                this.sendMessageToWebview({
                    command: 'addResponse',
                    text: response.completion,
                    source: 'copilot'
                });
            }
        }
        catch (error) {
            // Hide the loading indicator
            this.sendMessageToWebview({ command: 'setLoading', isLoading: false });
            // Show an error message
            this.sendMessageToWebview({
                command: 'addError',
                text: `Error: ${error}`,
                source: 'system'
            });
            vscode.window.showErrorMessage(`Failed to get response from Copilot: ${error}`);
        }
    }
    /**
     * Handles toggling between providers (Copilot or local LLM)
     * @param provider The provider to switch to
     */
    handleToggleProvider(provider) {
        // Save the selected provider to configuration
        vscode.workspace.getConfiguration('copilot-ppa').update('selectedProvider', provider, true);
        // Show a notification
        this.sendMessageToWebview({
            command: 'addNotification',
            text: `Switched to ${provider} provider`,
            source: 'system'
        });
    }
    /**
     * Handles clearing the chat history
     */
    handleClearChat() {
        this.sendMessageToWebview({ command: 'clearChat' });
    }
    /**
     * Sends a message to the webview
     * @param message The message to send
     */
    sendMessageToWebview(message) {
        if (this.panel) {
            this.panel.webview.postMessage(message);
        }
    }
    /**
     * Gets the HTML content for the webview
     */
    getWebviewContent() {
        // Get the current theme
        const isDarkTheme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
        const themeClass = isDarkTheme ? 'vscode-dark' : 'vscode-light';
        // Get configuration
        const config = vscode.workspace.getConfiguration('copilot-ppa');
        const selectedProvider = config.get('selectedProvider', 'local');
        // Create CSS URI
        const cssUri = this.panel?.webview.asWebviewUri(vscode.Uri.file(path.join(this.extensionPath, 'media', 'copilot-integration.css')));
        // Handle message formatting in a separate script
        const messageFormattingScript = `
function formatMessage(text) {
    // Escape HTML special characters
    text = text.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    // Handle code blocks with syntax highlighting
    text = text.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (_, lang, code) => 
        '<pre><code class="' + (lang || '') + '">' + code + '</code></pre>'
    );

    // Handle inline code
    text = text.replace(/\`([^\`]+)\`/g, (_, code) => 
        '<code>' + code + '</code>'
    );

    // Handle line breaks
    text = text.replace(/\\n/g, '<br>');

    return text;
}
`;
        // Add the formatting script to the head section
        const headContent = `
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Copilot Integration</title>
    <link rel="stylesheet" type="text/css" href="${cssUri}">
    <script>${messageFormattingScript}</script>
    <style>
        body {
            padding: 0;
            margin: 0;
            font-family: var(--vscode-font-family);
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            padding: 10px;
        }
        .toolbar {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }
        .message {
            margin-bottom: 12px;
            padding: 8px 12px;
            border-radius: 6px;
            max-width: 80%;
        }
        .user-message {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            align-self: flex-end;
            margin-left: auto;
        }
        .copilot-message {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            color: var(--vscode-editor-foreground);
            align-self: flex-start;
        }
        .system-message {
            background-color: var(--vscode-editorInfo-foreground);
            color: var(--vscode-editor-background);
            align-self: center;
            font-style: italic;
        }
        .input-container {
            display: flex;
            padding: 8px;
            background-color: var(--vscode-editor-background);
            border-top: 1px solid var(--vscode-panel-border);
        }
        .input-box {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            resize: none;
            border-radius: 4px;
            min-height: 60px;
        }
        .send-button {
            margin-left: 8px;
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .send-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .toggle-container {
            display: flex;
            align-items: center;
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 28px;
            margin-right: 10px;
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
            transition: .4s;
            border-radius: 34px;
        }
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 4px;
            background-color: var(--vscode-editor-foreground);
            transition: .4s;
            border-radius: 50%;
        }
        input:checked + .toggle-slider {
            background-color: var(--vscode-button-background);
        }
        input:checked + .toggle-slider:before {
            transform: translateX(32px);
        }
        .loading {
            display: flex;
            justify-content: center;
            margin: 8px 0;
        }
        .loading-dots {
            display: flex;
        }
        .loading-dots div {
            width: 8px;
            height: 8px;
            margin: 0 4px;
            background-color: var(--vscode-button-background);
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out both;
        }
        .loading-dots div:nth-child(1) {
            animation-delay: -0.32s;
        }
        .loading-dots div:nth-child(2) {
            animation-delay: -0.16s;
        }
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }
        .clear-button {
            padding: 4px 8px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .clear-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
    </style>
</head>
`;
        return `<!DOCTYPE html>
        <html lang="en" class="${themeClass}">
        ${headContent}
        <body>
            <div class="container">
                <div class="toolbar">
                    <div class="toggle-container">
                        <label class="toggle-switch">
                            <input type="checkbox" id="provider-toggle" ${selectedProvider === 'copilot' ? 'checked' : ''}>
                            <span class="toggle-slider"></span>
                        </label>
                        <span id="provider-label">${selectedProvider === 'copilot' ? 'Copilot' : 'Local LLM'}</span>
                    </div>
                    <button class="clear-button" id="clear-button">Clear Chat</button>
                </div>
                <div class="chat-container" id="chat-container">
                    <div class="message system-message">
                        Start a conversation with ${selectedProvider === 'copilot' ? 'GitHub Copilot' : 'your local LLM'}.
                    </div>
                </div>
                <div class="loading" id="loading-indicator" style="display: none;">
                    <div class="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
                <div class="input-container">
                    <textarea class="input-box" id="input-box" placeholder="Type your message here..." rows="3"></textarea>
                    <button class="send-button" id="send-button">Send</button>
                </div>
            </div>
            <script>
                (function() {
                    const vscode = acquireVsCodeApi();
                    const chatContainer = document.getElementById('chat-container');
                    const inputBox = document.getElementById('input-box');
                    const sendButton = document.getElementById('send-button');
                    const providerToggle = document.getElementById('provider-toggle');
                    const providerLabel = document.getElementById('provider-label');
                    const loadingIndicator = document.getElementById('loading-indicator');
                    const clearButton = document.getElementById('clear-button');
                    
                    // Initialize with saved state if available
                    const previousState = vscode.getState() || { messages: [] };
                    if (previousState.messages && previousState.messages.length) {
                        previousState.messages.forEach(msg => {
                            addMessageToUI(msg.text, msg.source);
                        });
                    }
                    
                    // Send message when button clicked
                    sendButton.addEventListener('click', sendMessage);
                    
                    // Send message when Enter is pressed (without Shift)
                    inputBox.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    });
                    
                    // Toggle between Copilot and local LLM
                    providerToggle.addEventListener('change', () => {
                        const provider = providerToggle.checked ? 'copilot' : 'local';
                        providerLabel.textContent = providerToggle.checked ? 'Copilot' : 'Local LLM';
                        vscode.postMessage({
                            command: 'toggleProvider',
                            provider: provider
                        });
                    });
                    
                    // Clear chat history
                    clearButton.addEventListener('click', () => {
                        vscode.postMessage({ command: 'clearChat' });
                    });
                    
                    // Function to send a message
                    function sendMessage() {
                        const text = inputBox.value.trim();
                        if (text) {
                            vscode.postMessage({
                                command: 'sendPrompt',
                                text: text
                            });
                            inputBox.value = '';
                        }
                    }
                    
                    // Function to add a message to the UI
                    function addMessageToUI(text, source) {
                        const messageDiv = document.createElement('div');
                        messageDiv.classList.add('message');
                        
                        if (source === 'user') {
                            messageDiv.classList.add('user-message');
                        } else if (source === 'copilot' || source === 'local') {
                            messageDiv.classList.add('copilot-message');
                        } else {
                            messageDiv.classList.add('system-message');
                        }
                        
                        // Format the message text (handle code blocks, links, etc.)
                        messageDiv.innerHTML = formatMessage(text);
                        
                        chatContainer.appendChild(messageDiv);
                        chatContainer.scrollTop = chatContainer.scrollHeight;
                        
                        // Save the message to state
                        const state = vscode.getState() || { messages: [] };
                        state.messages.push({ text, source });
                        vscode.setState(state);
                    }
                    
                    // Handle messages from the extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        
                        switch (message.command) {
                            case 'addMessage':
                                addMessageToUI(message.text, message.source);
                                break;
                            case 'addResponse':
                                addMessageToUI(message.text, message.source);
                                break;
                            case 'addError':
                                addMessageToUI(message.text, 'system');
                                break;
                            case 'addNotification':
                                addMessageToUI(message.text, 'system');
                                break;
                            case 'clearChat':
                                chatContainer.innerHTML = '';
                                addMessageToUI('Chat history cleared.', 'system');
                                vscode.setState({ messages: [] });
                                break;
                            case 'setLoading':
                                loadingIndicator.style.display = message.isLoading ? 'flex' : 'none';
                                break;
                        }
                    });
                }())
            </script>
        </body>
        </html>`;
    }
    /**
     * Disposes of the webview panel
     */
    dispose() {
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        // Dispose of all disposables
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
}
exports.CopilotIntegrationWebview = CopilotIntegrationWebview;
//# sourceMappingURL=copilotIntegrationWebview.js.map