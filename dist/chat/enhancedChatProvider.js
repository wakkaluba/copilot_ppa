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
    context;
    contextManager;
    llmProvider;
    view;
    constructor(context, contextManager, llmProvider) {
        this.context = context;
        this.contextManager = contextManager;
        this.llmProvider = llmProvider;
    }
    setWebview(view) {
        this.view = view;
        this.renderChatInterface();
    }
    renderChatInterface() {
        if (!this.view)
            return;
        const messages = this.contextManager.listMessages();
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }
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
        this.contextManager.appendMessage(userMessage);
        // Send to view
        this.addMessageToUI(userMessage);
        // Generate a response
        await this.generateResponse(userMessage);
        // Update suggestions based on new context
        this.updateSuggestions();
    }
    async generateResponse(userMessage) {
        try {
            // Show thinking state
            this.updateStatus('Thinking...');
            // Get enhanced context
            const context = this.contextManager.getContextString();
            // Generate response
            const response = await this.llmProvider.generateCompletion(userMessage.content, { context });
            // Create assistant message
            const assistantMessage = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            // Add to context and UI
            this.contextManager.appendMessage(assistantMessage);
            this.addMessageToUI(assistantMessage);
            // Clear status
            this.updateStatus('');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorResponse = {
                id: (0, uuid_1.v4)(),
                role: 'assistant',
                content: `Error: ${errorMessage}`,
                timestamp: Date.now()
            };
            this.addMessageToUI(errorResponse);
            this.updateStatus('');
            vscode.window.showErrorMessage(`LLM Error: ${errorMessage}`);
        }
    }
    addMessageToUI(message) {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'addMessage',
                message
            });
        }
    }
    updateStatus(status) {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'updateStatus',
                status
            });
        }
    }
    updateSuggestions() {
        if (this.view) {
            const suggestions = this.contextManager.getSuggestions();
            this.view.webview.postMessage({
                type: 'updateSuggestions',
                suggestions
            });
        }
    }
    async clearHistory() {
        await this.contextManager.clear();
        if (this.view) {
            this.view.webview.postMessage({
                type: 'clearMessages'
            });
        }
    }
    dispose() {
        // Cleanup if needed
    }
}
exports.EnhancedChatProvider = EnhancedChatProvider;
//# sourceMappingURL=enhancedChatProvider.js.map