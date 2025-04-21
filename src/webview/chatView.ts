import * as vscode from 'vscode';
import { LLMProviderManager } from '../llm/llmProviderManager';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';
import { ChatMessage } from '../types/conversation';
import { ChatWebviewService } from '../services/chat/ChatWebviewService';
import { ChatMessageService } from '../services/chat/ChatMessageService';
import { ChatStatusService } from '../services/chat/ChatStatusService';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'localLlmAgent.chatView';
    private _view?: vscode.WebviewView;
    private readonly webviewService: ChatWebviewService;
    private readonly messageService: ChatMessageService;
    private readonly statusService: ChatStatusService;
    private _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly llmProviderManager: LLMProviderManager,
        private readonly sessionManager: LLMSessionManager,
        private readonly contextManager: ContextManager,
        private readonly connectionStatusService: ConnectionStatusService
    ) {
        this.webviewService = new ChatWebviewService(extensionUri);
        this.messageService = new ChatMessageService(sessionManager, contextManager);
        this.statusService = new ChatStatusService(connectionStatusService);
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this._disposables.push(
            this.statusService.onStatusChanged(state => {
                this.updateConnectionStatus(state);
            }),
            this.llmProviderManager.on('providerStatusChanged', ({ type, status }) => {
                this.updateProviderStatus(type, status);
            })
        );
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;
        this.webviewService.initialize(webviewView);
        this.registerWebviewMessageHandlers();
        this.updateChatView();
        this.updateConnectionStatus(this.statusService.getCurrentStatus());
    }

    private async handleUserMessage(content: string): Promise<void> {
        if (!content.trim()) return;

        try {
            const messages = await this.messageService.handleUserMessage(content);
            this.updateChatView(messages);
        } catch (error) {
            this.updateChatView(this.messageService.addErrorMessage(error));
        }
    }

    private updateChatView(messages?: ChatMessage[]): void {
        if (this._view) {
            this.webviewService.updateChat(this._view.webview, messages || this.messageService.getMessages());
        }
    }

    private updateConnectionStatus(state: ConnectionState): void {
        if (this._view) {
            this.webviewService.updateConnectionStatus(
                this._view.webview,
                state,
                this.statusService.getStatusMessage(state)
            );
        }
    }

    private updateProviderStatus(type: string, status: LLMProviderStatus): void {
        if (this._view) {
            this.webviewService.updateProviderStatus(this._view.webview, type, status);
        }
    }

    private registerWebviewMessageHandlers(): void {
        if (!this._view) return;

        this._disposables.push(
            this._view.webview.onDidReceiveMessage(async (data) => {
                switch (data.type) {
                    case 'sendMessage':
                        await this.handleUserMessage(data.content);
                        break;
                    case 'clearChat':
                        this.messageService.clearMessages();
                        this.updateChatView();
                        break;
                }
            })
        );
    }

    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
    }
}
