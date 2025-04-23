import * as vscode from 'vscode';
import { ThemeService } from '../../services/ui/themeManager';
import { WebviewState } from '../copilotIntegrationPanel';

export class CopilotWebviewContentService {
    constructor(private readonly themeService: ThemeService) {}

    generateWebviewContent(
        stylesUri: vscode.Uri,
        state: WebviewState,
        isConnected: boolean,
        webview: vscode.Webview
    ): string {
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

    private renderMessages(messages: WebviewState['messages']): string {
        return messages.map(msg => `
            <div class="message ${msg.role}">
                <div class="message-content">${this.escapeHtml(msg.content)}</div>
            </div>
        `).join('');
    }

    private escapeHtml(html: string): string {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    private getClientScript(): string {
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