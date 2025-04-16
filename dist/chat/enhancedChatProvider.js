"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedChatProvider = void 0;
const uuid_1 = require("uuid");
class EnhancedChatProvider {
    constructor(context, contextManager, llmProvider) {
        this.context = context;
        this.contextManager = contextManager;
        this.llmProvider = llmProvider;
    }
    /**
     * Set the webview for rendering the chat UI
     */
    setWebview(view) {
        this.view = view;
        this.renderChatInterface();
    }
    /**
     * Render the chat interface
     */
    renderChatInterface() {
        if (!this.view) {
            return;
        }
        const webview = this.view.webview;
        // Generate a nonce for CSP
        const nonce = this.getNonce();
        // Get context-aware suggestions
        const suggestions = this.contextManager.generateSuggestions('');
        // Get the user's programming preferences for UI customization
        const preferredLanguage = this.contextManager.getPreferredLanguage() || 'General';
        const recentMessages = this.contextManager.getConversationHistory(5);
        webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <title>Enhanced Chat</title>
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
                    max-height: 100vh;
                    overflow: hidden;
                }
                
                .context-header {
                    padding: 8px 12px;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .context-badge {
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    border-radius: 10px;
                    padding: 2px 8px;
                    font-size: 11px;
                    margin-left: 8px;
                }
                
                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }
                
                .message {
                    margin-bottom: 12px;
                    padding: 8px 12px;
                    border-radius: 4px;
                    max-width: 85%;
                }
                
                .user-message {
                    align-self: flex-end;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    margin-left: auto;
                }
                
                .agent-message {
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    margin-right: auto;
                }
                
                .system-message {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    color: var(--vscode-foreground);
                    font-style: italic;
                    margin: 10px auto;
                    text-align: center;
                    max-width: 90%;
                }
                
                .input-container {
                    padding: 10px;
                    border-top: 1px solid var(--vscode-panel-border);
                    background-color: var(--vscode-editor-background);
                }
                
                .message-input {
                    width: 100%;
                    min-height: 60px;
                    max-height: 200px;
                    padding: 8px;
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    resize: vertical;
                    border-radius: 4px;
                    font-family: var(--vscode-font-family);
                }
                
                .control-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 8px;
                }
                
                .send-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 2px;
                    cursor: pointer;
                }
                
                .send-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                .control-options {
                    display: flex;
                    align-items: center;
                }
                
                .control-option {
                    margin-right: 8px;
                    cursor: pointer;
                    opacity: 0.7;
                }
                
                .control-option:hover {
                    opacity: 1;
                }
                
                .suggestions-container {
                    margin-bottom: 10px;
                }
                
                .suggestion-chip {
                    display: inline-block;
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    color: var(--vscode-foreground);
                    border-radius: 16px;
                    padding: 4px 12px;
                    margin: 0 8px 8px 0;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .suggestion-chip:hover {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                
                .context-controls {
                    display: flex;
                    align-items: center;
                    margin-top: 8px;
                }
                
                .context-switch {
                    display: flex;
                    align-items: center;
                    margin-right: 12px;
                    cursor: pointer;
                    user-select: none;
                }
                
                .switch-label {
                    margin-left: 6px;
                    font-size: 12px;
                }
                
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 30px;
                    height: 16px;
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
                    border-radius: 16px;
                }
                
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 12px;
                    width: 12px;
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
                    transform: translateX(14px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="context-header">
                    <div>
                        <span>Current context:</span>
                        <span class="context-badge">${preferredLanguage}</span>
                    </div>
                    <div>
                        <button id="clear-history" class="control-option">Clear history</button>
                    </div>
                </div>
                
                <div class="messages-container" id="messages">
                    ${this.renderMessages(recentMessages)}
                </div>
                
                <div class="input-container">
                    <div class="suggestions-container">
                        ${suggestions.map(suggestion => `<div class="suggestion-chip" data-suggestion="${this.escapeHtml(suggestion)}">${this.escapeHtml(suggestion)}</div>`).join('')}
                    </div>
                    
                    <textarea class="message-input" id="message-input" placeholder="Type your message here... Press Shift+Enter to send"></textarea>
                    
                    <div class="context-controls">
                        <label class="context-switch">
                            <span class="toggle-switch">
                                <input type="checkbox" id="workspace-switch" checked>
                                <span class="toggle-slider"></span>
                            </span>
                            <span class="switch-label">@workspace</span>
                        </label>
                        
                        <label class="context-switch">
                            <span class="toggle-switch">
                                <input type="checkbox" id="codebase-switch">
                                <span class="toggle-slider"></span>
                            </span>
                            <span class="switch-label">/codebase</span>
                        </label>
                    </div>
                    
                    <div class="control-bar">
                        <div class="control-options">
                            <span class="control-option" title="Upload file">📎</span>
                            <span class="control-option" title="Insert code snippet">📋</span>
                        </div>
                        <button class="send-button" id="send-button">Send</button>
                    </div>
                </div>
            </div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                const messagesContainer = document.getElementById('messages');
                const messageInput = document.getElementById('message-input');
                const sendButton = document.getElementById('send-button');
                const clearHistoryButton = document.getElementById('clear-history');
                const workspaceSwitch = document.getElementById('workspace-switch');
                const codebaseSwitch = document.getElementById('codebase-switch');
                
                // Restore scroll position when view is shown again
                const state = vscode.getState() || { scrollY: 0 };
                messagesContainer.scrollTop = state.scrollY;
                
                // Handle send message
                function sendMessage() {
                    const content = messageInput.value.trim();
                    if (!content) return;
                    
                    // Add workspace and codebase prefixes if enabled
                    let prefixedContent = content;
                    if (workspaceSwitch.checked) {
                        prefixedContent = '@workspace ' + prefixedContent;
                    }
                    if (codebaseSwitch.checked) {
                        prefixedContent = '/codebase ' + prefixedContent;
                    }
                    
                    vscode.postMessage({
                        command: 'sendMessage',
                        content: prefixedContent
                    });
                    
                    // Clear input
                    messageInput.value = '';
                    messageInput.focus();
                }
                
                // Send button click handler
                sendButton.addEventListener('click', sendMessage);
                
                // Also send on Shift+Enter
                messageInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                });
                
                // Suggestion click handler
                document.querySelectorAll('.suggestion-chip').forEach(chip => {
                    chip.addEventListener('click', () => {
                        messageInput.value = chip.dataset.suggestion;
                        messageInput.focus();
                    });
                });
                
                // Clear history handler
                clearHistoryButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to clear the conversation history?')) {
                        vscode.postMessage({
                            command: 'clearHistory'
                        });
                    }
                });
                
                // Handle messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'addMessage':
                            // Add a new message to the chat
                            const messageDiv = document.createElement('div');
                            messageDiv.className = 'message ' + message.role + '-message';
                            messageDiv.textContent = message.content;
                            messagesContainer.appendChild(messageDiv);
                            
                            // Scroll to bottom
                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            
                            // Save scroll position
                            vscode.setState({ scrollY: messagesContainer.scrollTop });
                            break;
                            
                        case 'updateSuggestions':
                            // Update suggestion chips
                            const suggestionsContainer = document.querySelector('.suggestions-container');
                            suggestionsContainer.innerHTML = message.suggestions.map(suggestion => 
                                \`<div class="suggestion-chip" data-suggestion="\${escapeHtml(suggestion)}">\${escapeHtml(suggestion)}</div>\`
                            ).join('');
                            
                            // Reattach event listeners
                            document.querySelectorAll('.suggestion-chip').forEach(chip => {
                                chip.addEventListener('click', () => {
                                    messageInput.value = chip.dataset.suggestion;
                                    messageInput.focus();
                                });
                            });
                            break;
                            
                        case 'clearMessages':
                            // Clear all messages
                            messagesContainer.innerHTML = '';
                            break;
                    }
                });
                
                // Focus input on load
                messageInput.focus();
                
                // Helper function to escape HTML
                function escapeHtml(text) {
                    return text
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                }
                
                // Save scroll position when scrolling
                messagesContainer.addEventListener('scroll', () => {
                    vscode.setState({ scrollY: messagesContainer.scrollTop });
                });
            </script>
        </body>
        </html>`;
    }
    /**
     * Handle user message
     */
    async handleUserMessage(content) {
        if (!content.trim()) {
            return;
        }
        // Create a user message
        const userMessage = {
            id: (0, uuid_1.v4)(),
            role: 'user',
            content: content,
            timestamp: Date.now()
        };
        // Add to context manager
        this.contextManager.addMessage(userMessage);
        // Send to view
        this.addMessageToUI(userMessage);
        // Generate a response
        await this.generateResponse(userMessage);
        // Update suggestions based on new context
        this.updateSuggestions();
    }
    /**
     * Generate a response from the LLM
     */
    async generateResponse(userMessage) {
        try {
            // Show typing indicator
            this.addSystemMessageToUI('The assistant is thinking...');
            // Build context-enhanced prompt
            const contextString = this.contextManager.buildContextString();
            const enhancedPrompt = `${contextString}\n\nUser message: ${userMessage.content}`;
            // Get response from LLM
            const response = await this.llmProvider.generateText(enhancedPrompt);
            // Remove typing indicator (need to implement this in the UI)
            this.removeSystemMessageFromUI();
            // Create assistant message
            const assistantMessage = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            // Add to context manager
            this.contextManager.addMessage(assistantMessage);
            // Send to view
            this.addMessageToUI(assistantMessage);
        }
        catch (error) {
            console.error('Error generating response:', error);
            this.addSystemMessageToUI(`Error: ${error.message || 'Failed to generate response'}`);
        }
    }
    /**
     * Add a message to the UI
     */
    addMessageToUI(message) {
        if (this.view) {
            this.view.webview.postMessage({
                command: 'addMessage',
                id: message.id,
                role: message.role,
                content: message.content
            });
        }
    }
    /**
     * Add a system message to the UI (temporary messages like loading indicators)
     */
    addSystemMessageToUI(content) {
        if (this.view) {
            this.view.webview.postMessage({
                command: 'addMessage',
                id: 'system-' + Date.now(),
                role: 'system',
                content: content
            });
        }
    }
    /**
     * Remove system messages from the UI
     */
    removeSystemMessageFromUI() {
        // This would need to be implemented in the UI
        // For now we'll just add a blank message to indicate completion
        if (this.view) {
            this.view.webview.postMessage({
                command: 'removeSystemMessages'
            });
        }
    }
    /**
     * Update the suggestions in the UI
     */
    updateSuggestions() {
        if (this.view) {
            const suggestions = this.contextManager.generateSuggestions('');
            this.view.webview.postMessage({
                command: 'updateSuggestions',
                suggestions: suggestions
            });
        }
    }
    /**
     * Clear the conversation history
     */
    async clearHistory() {
        await this.contextManager.clearAllContextData();
        if (this.view) {
            this.view.webview.postMessage({
                command: 'clearMessages'
            });
        }
    }
    /**
     * Render messages for the initial UI
     */
    renderMessages(messages) {
        return messages.map(message => {
            const cssClass = message.role + '-message';
            return `<div class="message ${cssClass}">${this.escapeHtml(message.content)}</div>`;
        }).join('');
    }
    /**
     * Generate a nonce for CSP
     */
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
exports.EnhancedChatProvider = EnhancedChatProvider;
//# sourceMappingURL=enhancedChatProvider.js.map