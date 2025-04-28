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
exports.EnhancedChatProvider = void 0;
const vscode = __importStar(require("vscode"));
const uuid_1 = require("uuid");
class EnhancedChatProvider {
    constructor(context, contextManager, llmProvider) {
        this.isStreaming = false;
        this.offlineCache = new Map();
        this.maxRetries = 3;
        this.contextManager = contextManager;
        this.llmProvider = llmProvider;
    }
    async handleContinueIteration() {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'showContinuePrompt',
            message: 'Continue to iterate?'
        });
    }
    setWebview(view) {
        this.view = view;
        // Handle webview messages
        this.view.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'sendMessage':
                    await this.handleUserMessage(message.message);
                    break;
                case 'clearChat':
                    await this.clearHistory();
                    break;
                case 'getMessages':
                    this.sendMessagesToWebview();
                    break;
                case 'getConnectionStatus':
                    this.updateConnectionStatus();
                    break;
                case 'connectLlm':
                    await this.llmProvider.connect();
                    this.updateConnectionStatus();
                    break;
                case 'copyToClipboard':
                    await vscode.env.clipboard.writeText(message.text);
                    vscode.window.showInformationMessage('Copied to clipboard');
                    break;
                case 'createSnippet':
                    await this.createCodeSnippet(message.code, message.language);
                    break;
                case 'continueIteration':
                    await this.handleContinueIteration();
                    break;
            }
        });
        // Initial render
        this.renderChatInterface();
    }
    renderChatInterface() {
        if (!this.view) {
            return;
        }
        this.sendMessagesToWebview();
        this.updateConnectionStatus();
    }
    sendMessagesToWebview() {
        if (!this.view) {
            return;
        }
        const messages = this.contextManager.listMessages();
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }
    updateConnectionStatus() {
        if (!this.view) {
            return;
        }
        const isConnected = this.llmProvider.isConnected();
        const status = {
            state: isConnected ? 'connected' : 'disconnected',
            message: isConnected ? 'Connected to LLM' : 'Not connected to LLM',
            isInputDisabled: !isConnected
        };
        this.view.webview.postMessage({
            type: 'updateConnectionStatus',
            status
        });
    }
    async handleUserMessage(content) {
        if (!content.trim()) {
            return;
        }
        const userMessage = {
            id: (0, uuid_1.v4)(),
            role: 'user',
            content: content,
            timestamp: Date.now()
        };
        this.contextManager.appendMessage(userMessage);
        this.sendMessagesToWebview();
        if (!this.llmProvider.isConnected()) {
            await this.handleOfflineMode(userMessage);
            return;
        }
        let retryCount = 0;
        while (retryCount < this.maxRetries) {
            try {
                await this.generateResponse(userMessage);
                // Show continue prompt after successful response
                if (content.toLowerCase().includes('continue') || content.toLowerCase().includes('iterate')) {
                    await this.handleContinueIteration();
                }
                break;
            }
            catch (error) {
                retryCount++;
                if (retryCount === this.maxRetries) {
                    throw error;
                }
            }
        }
    }
    async generateResponse(userMessage) {
        this.isStreaming = true;
        this.updateStatus('Thinking...');
        let currentResponse = '';
        try {
            const context = this.contextManager.getContextString();
            await this.llmProvider.generateResponse(userMessage.content, { context }, (content) => {
                currentResponse += content;
                this.updateStreamingContent(currentResponse);
            });
            const assistantMessage = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: currentResponse,
                timestamp: Date.now()
            };
            this.contextManager.appendMessage(assistantMessage);
            this.sendMessagesToWebview();
        }
        finally {
            this.isStreaming = false;
            this.updateStatus('');
        }
    }
    async handleOfflineMode(message) {
        // Cache message for later sync
        const conversationId = this.contextManager.getCurrentConversationId();
        const cachedMessages = this.offlineCache.get(conversationId) || [];
        cachedMessages.push(message);
        this.offlineCache.set(conversationId, cachedMessages);
        const offlineMessage = {
            id: (0, uuid_1.v4)(),
            role: 'system',
            content: 'Currently offline. Message saved and will be processed when connection is restored.',
            timestamp: Date.now()
        };
        this.contextManager.appendMessage(offlineMessage);
        this.sendMessagesToWebview();
    }
    async handleError(error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorResponse = {
            id: (0, uuid_1.v4)(),
            role: 'system',
            content: `Error: ${errorMessage}\nPlease try again or check your connection.`,
            timestamp: Date.now()
        };
        this.contextManager.appendMessage(errorResponse);
        this.sendMessagesToWebview();
        this.updateStatus('');
        vscode.window.showErrorMessage(`Chat Error: ${errorMessage}`);
    }
    async waitBeforeRetry(retryCount) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    updateStreamingContent(content) {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'updateStreamingContent',
            content
        });
    }
    async syncOfflineMessages() {
        if (!this.llmProvider.isConnected()) {
            return;
        }
        const conversationId = this.contextManager.getCurrentConversationId();
        const cachedMessages = this.offlineCache.get(conversationId) || [];
        if (cachedMessages.length === 0) {
            return;
        }
        for (const message of cachedMessages) {
            await this.generateResponse(message);
        }
        this.offlineCache.delete(conversationId);
    }
    updateStatus(status) {
        if (!this.view) {
            return;
        }
        this.view.webview.postMessage({
            type: 'updateStatus',
            status
        });
    }
    async createCodeSnippet(code, language) {
        try {
            const snippet = new vscode.SnippetString(code);
            const doc = await vscode.workspace.openTextDocument({
                language: language || 'text',
                content: ''
            });
            const editor = await vscode.window.showTextDocument(doc);
            await editor.insertSnippet(snippet);
            vscode.window.showInformationMessage('Code snippet created');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to create snippet: ${errorMessage}`);
        }
    }
    async clearHistory() {
        await this.contextManager.clear();
        this.sendMessagesToWebview();
    }
    dispose() {
        // Cleanup
    }
}
exports.EnhancedChatProvider = EnhancedChatProvider;
//# sourceMappingURL=enhancedChatProvider.js.map