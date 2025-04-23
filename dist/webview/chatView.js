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
exports.ChatViewHandler = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("../services/llm/types");
class ChatViewHandler {
    extensionUri;
    chatManager;
    view;
    currentSession;
    constructor(extensionUri, chatManager) {
        this.extensionUri = extensionUri;
        this.chatManager = chatManager;
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
    }
    setupEventListeners() {
        this.chatManager.on(types_1.ChatEvent.MessageHandled, () => this.updateMessages());
        this.chatManager.on(types_1.ChatEvent.HistoryCleared, () => this.updateMessages());
        this.chatManager.on(types_1.ChatEvent.Error, (event) => this.handleError(event));
    }
    async initializeWebview() {
        if (!this.view)
            return;
        // Create initial session if needed
        if (!this.currentSession) {
            this.currentSession = await this.chatManager.createSession();
        }
        // Set up the webview HTML
        this.view.webview.html = this.getWebviewContent();
        // Send initial state
        this.updateMessages();
        this.updateConnectionStatus();
    }
    registerMessageHandlers() {
        if (!this.view)
            return;
        this.view.webview.onDidReceiveMessage(async (message) => {
            try {
                switch (message.type) {
                    case 'sendMessage':
                        await this.chatManager.handleUserMessage(this.currentSession.id, message.content);
                        break;
                    case 'clearChat':
                        if (this.currentSession) {
                            await this.chatManager.clearSessionHistory(this.currentSession.id);
                        }
                        break;
                    case 'getMessages':
                        this.updateMessages();
                        break;
                    case 'getConnectionStatus':
                        this.updateConnectionStatus();
                        break;
                    case 'copyToClipboard':
                        await vscode.env.clipboard.writeText(message.text);
                        vscode.window.showInformationMessage('Copied to clipboard');
                        break;
                }
            }
            catch (error) {
                this.handleError({ error });
            }
        });
    }
    updateMessages() {
        if (!this.view || !this.currentSession)
            return;
        const messages = this.chatManager.getSessionMessages(this.currentSession.id);
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }
    updateConnectionStatus() {
        if (!this.view)
            return;
        const status = this.chatManager.getConnectionStatus();
        this.view.webview.postMessage({
            type: 'updateConnectionStatus',
            status
        });
    }
    handleError(event) {
        const errorMessage = event.error instanceof Error ?
            event.error.message :
            String(event.error);
        vscode.window.showErrorMessage(`Chat Error: ${errorMessage}`);
    }
    getWebviewContent() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat</title>
                <link rel="stylesheet" href="${this.getResourceUri('chat.css')}">
            </head>
            <body>
                <div id="chat-container">
                    <div id="messages"></div>
                    <div id="input-container">
                        <textarea id="message-input" placeholder="Type your message..."></textarea>
                        <button id="send-button">Send</button>
                    </div>
                </div>
                <script src="${this.getResourceUri('chat.js')}"></script>
            </body>
            </html>
        `;
    }
    getResourceUri(fileName) {
        const filePath = vscode.Uri.joinPath(this.extensionUri, 'media', fileName);
        return this.view.webview.asWebviewUri(filePath).toString();
    }
    dispose() {
        // Clean up any resources
    }
}
exports.ChatViewHandler = ChatViewHandler;
//# sourceMappingURL=chatView.js.map