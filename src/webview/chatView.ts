import * as vscode from 'vscode';
import { LLMProviderManager } from '../llm/llmProviderManager';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';

/**
 * Represents message data in a chat conversation
 */
interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

/**
 * Manages the chat interface webview panel
 */
export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'localLlmAgent.chatView';
    private _view?: vscode.WebviewView;
    private _messages: ChatMessage[] = [];
    private _disposables: vscode.Disposable[] = [];
    private _connectionStatusService: ConnectionStatusService;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _llmProviderManager: LLMProviderManager,
        connectionStatusService: ConnectionStatusService
    ) {
        this._connectionStatusService = connectionStatusService;
        
        // Listen for connection status changes
        this._disposables.push(
            this._connectionStatusService.onDidChangeState(state => {
                this._updateConnectionStatus(state);
            })
        );
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview);

        // Handle messages from the webview
        this._disposables.push(
            webviewView.webview.onDidReceiveMessage(async (data) => {
                switch (data.type) {
                    case 'sendMessage':
                        await this._handleUserMessage(data.message);
                        break;
                    case 'clearChat':
                        this._messages = [];
                        this._updateChatView();
                        break;
                }
            })
        );

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
    private async _handleUserMessage(content: string): Promise<void> {
        if (!content.trim()) {
            return;
        }

        // Add user message
        const userMessage: ChatMessage = {
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
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            this._messages.push(assistantMessage);
            
            // Clear loading state and update view
            this._view?.webview.postMessage({ type: 'updateStatus', status: '' });
            this._updateChatView();
        } catch (error) {
            // Handle error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            const assistantMessage: ChatMessage = {
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
    private _updateChatView() {
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
    private _getWebviewContent(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.js')
        );
        const stylesUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'chat.css')
        );
        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css')
        );

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
    private _updateConnectionStatus(state: ConnectionState) {
        if (!this._view) {
            return;
        }
        
        const statusMessage = this._getStatusMessage(state);
        const isDisabled = state !== ConnectionState.Connected;
        
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
    private _getStatusMessage(state: ConnectionState): string {
        switch (state) {
            case ConnectionState.Connected:
                const modelName = this._connectionStatusService.activeModelName;
                return modelName ? `Connected to ${modelName}` : 'Connected to LLM';
                
            case ConnectionState.Connecting:
                return 'Connecting to LLM...';
                
            case ConnectionState.Error:
                return 'Error connecting to LLM';
                
            case ConnectionState.Disconnected:
            default:
                return 'Not connected to LLM';
        }
    }

    /**
     * Dispose of resources
     */
    public dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
