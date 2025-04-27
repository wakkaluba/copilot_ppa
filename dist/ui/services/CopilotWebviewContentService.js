"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotWebviewContentService = void 0;
class CopilotWebviewContentService {
    constructor(themeService) {
        this.themeService = themeService;
    }
    generateWebviewContent(stylesUri, state, isConnected, webview) {
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Assistant</title>
                <link href="${stylesUri}" rel="stylesheet">
            </head>
            <body class="${this.themeService.getCurrentTheme()}">
                <div class="container">
                    <div class="status-bar">
                        <div class="connection-status ${isConnected ? 'connected' : 'disconnected'}">
                            <span class="status-dot"></span>
                            <span class="status-text">${isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <div class="mode-toggle">
                            <label class="switch">
                                <input type="checkbox" id="llmModeToggle" ${state.isLocalLLMActive ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                            <span>Local LLM Mode</span>
                        </div>
                    </div>
                    
                    <div class="messages-container" id="messages">
                        ${this.renderMessages(state.messages)}
                    </div>

                    <div class="input-container">
                        <textarea id="messageInput" placeholder="Type your message..."></textarea>
                        <button id="sendButton">Send</button>
                    </div>
                </div>

                <script>
                    ${this.getClientScript()}
                </script>
            </body>
            </html>`;
    }
    renderMessages(messages) {
        return messages.map(msg => `
            <div class="message ${msg.role}">
                <div class="message-content">${this.escapeHtml(msg.content)}</div>
            </div>
        `).join('');
    }
    escapeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }
    getClientScript() {
        return `(function() {
            const vscode = acquireVsCodeApi();
            const messageInput = document.getElementById('messageInput');
            const sendButton = document.getElementById('sendButton');
            const llmModeToggle = document.getElementById('llmModeToggle');

            sendButton.addEventListener('click', () => {
                const text = messageInput.value.trim();
                if (text) {
                    vscode.postMessage({ command: 'sendMessage', text });
                    messageInput.value = '';
                }
            });

            llmModeToggle.addEventListener('change', () => {
                vscode.postMessage({ command: 'toggleLLMMode' });
            });

            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendButton.click();
                }
            });
        })();`;
    }
}
exports.CopilotWebviewContentService = CopilotWebviewContentService;
//# sourceMappingURL=CopilotWebviewContentService.js.map