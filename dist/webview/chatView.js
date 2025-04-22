"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatViewProvider = void 0;
const ChatWebviewService_1 = require("../services/chat/ChatWebviewService");
const ChatMessageService_1 = require("../services/chat/ChatMessageService");
const ChatStatusService_1 = require("../services/chat/ChatStatusService");
class ChatViewProvider {
    extensionUri;
    llmProviderManager;
    sessionManager;
    contextManager;
    connectionStatusService;
    static viewType = 'localLlmAgent.chatView';
    _view;
    webviewService;
    messageService;
    statusService;
    _disposables = [];
    constructor(extensionUri, llmProviderManager, sessionManager, contextManager, connectionStatusService) {
        this.extensionUri = extensionUri;
        this.llmProviderManager = llmProviderManager;
        this.sessionManager = sessionManager;
        this.contextManager = contextManager;
        this.connectionStatusService = connectionStatusService;
        this.webviewService = new ChatWebviewService_1.ChatWebviewService(extensionUri);
        this.messageService = new ChatMessageService_1.ChatMessageService(sessionManager, contextManager);
        this.statusService = new ChatStatusService_1.ChatStatusService(connectionStatusService);
        this.setupEventListeners();
    }
    setupEventListeners() {
        this._disposables.push(this.statusService.onStatusChanged(state => {
            this.updateConnectionStatus(state);
        }), this.llmProviderManager.on('providerStatusChanged', ({ type, status }) => {
            this.updateProviderStatus(type, status);
        }));
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        this.webviewService.initialize(webviewView);
        this.registerWebviewMessageHandlers();
        this.updateChatView();
        this.updateConnectionStatus(this.statusService.getCurrentStatus());
    }
    async handleUserMessage(content) {
        if (!content.trim())
            return;
        try {
            const messages = await this.messageService.handleUserMessage(content);
            this.updateChatView(messages);
        }
        catch (error) {
            this.updateChatView(this.messageService.addErrorMessage(error));
        }
    }
    updateChatView(messages) {
        if (this._view) {
            this.webviewService.updateChat(this._view.webview, messages || this.messageService.getMessages());
        }
    }
    updateConnectionStatus(state) {
        if (this._view) {
            this.webviewService.updateConnectionStatus(this._view.webview, state, this.statusService.getStatusMessage(state));
        }
    }
    updateProviderStatus(type, status) {
        if (this._view) {
            this.webviewService.updateProviderStatus(this._view.webview, type, status);
        }
    }
    registerWebviewMessageHandlers() {
        if (!this._view)
            return;
        this._disposables.push(this._view.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this.handleUserMessage(data.content);
                    break;
                case 'clearChat':
                    this.messageService.clearMessages();
                    this.updateChatView();
                    break;
            }
        }));
    }
    dispose() {
        this._disposables.forEach(d => d.dispose());
    }
}
exports.ChatViewProvider = ChatViewProvider;
//# sourceMappingURL=chatView.js.map