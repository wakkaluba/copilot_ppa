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
exports.UnifiedChatViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const logger_1 = require("../utils/logger");
const themeService_1 = require("../services/ui/themeService");
class UnifiedChatViewProvider {
    extensionUri;
    chatManager;
    static viewType = 'copilotPPA.chatView';
    view;
    currentSession;
    logger;
    themeService;
    disposables = [];
    constructor(extensionUri, chatManager) {
        this.extensionUri = extensionUri;
        this.chatManager = chatManager;
        this.logger = new logger_1.Logger('ChatView');
        this.themeService = themeService_1.ThemeService.getInstance();
        this.setupEventListeners();
    }
    resolveWebviewView(webviewView, _context, _token) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.extensionUri]
        };
        this.initializeWebview();
        this.registerMessageHandlers();
        // Clean up when view is disposed
        webviewView.onDidDispose(() => {
            this.dispose();
        });
    }
    setupEventListeners() {
        this.disposables.push(this.chatManager.onMessageHandled(() => this.updateMessages()), this.chatManager.onHistoryCleared(() => this.updateMessages()), this.chatManager.onError((event) => this.handleError(event)), this.chatManager.onConnectionStatusChanged(() => this.updateConnectionStatus()), this.themeService.onThemeChanged(() => this.updateTheme()));
    }
    async initializeWebview() {
        if (!this.view) {
            return;
        }
        if (!this.currentSession) {
            this.currentSession = await this.chatManager.createSession();
        }
        this.view.webview.html = this.getWebviewContent();
        this.updateMessages();
        this.updateConnectionStatus();
    }
    registerMessageHandlers() {
        if (!this.view) {
            return;
        }
        this.view.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.type) {
                    case 'sendMessage':
                        await this.handleMessage(message.content);
                        break;
                    case 'clearChat':
                        await this.clearChat();
                        break;
                    case 'getMessages':
                        this.updateMessages();
                        break;
                    case 'getConnectionStatus':
                        this.updateConnectionStatus();
                        break;
                    case 'copyToClipboard':
                        await this.copyToClipboard(message.text);
                        break;
                    case 'createSnippet':
                        await this.createSnippet(message.code, message.language);
                        break;
                    case 'continueIteration':
                        await this.handleContinueIteration();
                        break;
                }
            }
            catch (error) {
                this.handleError({ error });
            }
        });
    }
    showContinuePrompt() {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'showContinuePrompt',
            message: 'Continue to iterate?'
        });
    }
    async handleContinueIteration() {
        if (!this.currentSession) {
            return;
        }
        await this.handleMessage('Continue');
    }
    async handleMessage(content) {
        if (!content.trim() || !this.currentSession) {
            return;
        }
        await this.chatManager.handleUserMessage(this.currentSession.id, content);
        // Show continue prompt after certain messages
        if (content.toLowerCase().includes('continue') ||
            content.toLowerCase().includes('iterate')) {
            this.showContinuePrompt();
        }
    }
    async clearChat() {
        if (this.currentSession) {
            await this.chatManager.clearSessionHistory(this.currentSession.id);
        }
    }
    async copyToClipboard(text) {
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage('Copied to clipboard');
    }
    async createSnippet(code, language) {
        // TODO: Implement snippet creation
        this.logger.debug('Snippet creation requested', { code, language });
    }
    updateMessages() {
        if (!this.view || !this.currentSession) {
            return;
        }
        const messages = this.chatManager.getSessionMessages(this.currentSession.id);
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }
    updateConnectionStatus() {
        if (!this.view) {
            return;
        }
        const status = this.chatManager.getConnectionStatus();
        this.view.webview.postMessage({
            type: 'updateConnectionStatus',
            status
        });
    }
    updateTheme() {
        if (!this.view) {
            return;
        }
        const theme = this.themeService.currentTheme;
        this.view.webview.postMessage({
            type: 'updateTheme',
            theme
        });
    }
    handleError(event) {
        const errorMessage = event.error instanceof Error ?
            event.error.message :
            String(event.error);
        this.logger.error('Chat error occurred', { error: errorMessage });
        vscode.window.showErrorMessage(`Chat Error: ${errorMessage}`);
        if (this.view) {
            this.view.webview.postMessage({
                type: 'showError',
                message: errorMessage
            });
        }
    }
    getWebviewContent() {
        const cssUri = this.getResourceUri('chat.css');
        const jsUri = this.getResourceUri('chat.js');
        const theme = this.themeService.currentTheme;
        return `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this.view.webview.cspSource}; script-src ${this.view.webview.cspSource};">
                <title>Chat</title>
                <link rel="stylesheet" href="${cssUri}">
            </head>
            <body class="theme-${theme}">
                <div id="chat-container">
                    <div class="status-bar">
                        <div class="connection-status">
                            <span class="status-dot"></span>
                            <span class="status-text">Initializing...</span>
                        </div>
                    </div>

                    <div id="messages" class="messages"></div>

                    <div class="continue-prompt" style="display: none;">
                        <div class="continue-message">Continue to iterate?</div>
                        <div class="continue-actions">
                            <button id="btn-continue-yes" class="btn-continue">Yes</button>
                            <button id="btn-continue-no" class="btn-continue">No</button>
                        </div>
                    </div>

                    <div class="error-container" style="display: none;">
                        <div class="error-message"></div>
                    </div>

                    <div class="input-container">
                        <div class="toolbar">
                            <button id="clear-chat">Clear Chat</button>
                        </div>
                        <div class="message-input">
                            <textarea id="message-input" placeholder="Type your message..." rows="3"></textarea>
                            <button id="send-button">Send</button>
                        </div>
                    </div>
                </div>
                <script src="${jsUri}"></script>
            </body>
            </html>`;
    }
    getResourceUri(fileName) {
        const filePath = vscode.Uri.joinPath(this.extensionUri, 'media', fileName);
        return this.view.webview.asWebviewUri(filePath).toString();
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.currentSession = undefined;
    }
}
exports.UnifiedChatViewProvider = UnifiedChatViewProvider;
//# sourceMappingURL=chatView.js.map