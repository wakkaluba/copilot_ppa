import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { ContextManager } from '../services/ContextManager';
import { LLMProvider } from '../llm/llmProvider';
import { ChatMessage } from '../types/conversation';

export class EnhancedChatProvider {
    private context: vscode.ExtensionContext;
    private contextManager: ContextManager;
    private llmProvider: LLMProvider;
    private view: vscode.WebviewView | undefined;
    
    constructor(context: vscode.ExtensionContext, contextManager: ContextManager, llmProvider: LLMProvider) {
        this.context = context;
        this.contextManager = contextManager;
        this.llmProvider = llmProvider;
    }
    
    public setWebview(view: vscode.WebviewView): void {
        this.view = view;
        this.renderChatInterface();
    }

    private renderChatInterface(): void {
        if (!this.view) return;
        
        const messages = this.contextManager.listMessages();
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }

    public async handleUserMessage(content: string): Promise<void> {
        if (!content.trim()) {
            return;
        }
        
        // Create a user message
        const userMessage: ChatMessage = {
            id: uuidv4(),
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

    private async generateResponse(userMessage: ChatMessage): Promise<void> {
        try {
            // Show thinking state
            this.updateStatus('Thinking...');
            
            // Get enhanced context
            const context = this.contextManager.getContextString();
            
            // Generate response
            const response = await this.llmProvider.generateCompletion(
                userMessage.content,
                { context }
            );
            
            // Create assistant message
            const assistantMessage: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            };
            
            // Add to context and UI
            this.contextManager.appendMessage(assistantMessage);
            this.addMessageToUI(assistantMessage);
            
            // Clear status
            this.updateStatus('');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            const errorResponse: ChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: `Error: ${errorMessage}`,
                timestamp: Date.now()
            };
            
            this.addMessageToUI(errorResponse);
            this.updateStatus('');
            
            vscode.window.showErrorMessage(`LLM Error: ${errorMessage}`);
        }
    }

    private addMessageToUI(message: ChatMessage): void {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'addMessage',
                message
            });
        }
    }

    private updateStatus(status: string): void {
        if (this.view) {
            this.view.webview.postMessage({
                type: 'updateStatus',
                status
            });
        }
    }

    private updateSuggestions(): void {
        if (this.view) {
            const suggestions = this.contextManager.getSuggestions();
            this.view.webview.postMessage({
                type: 'updateSuggestions',
                suggestions
            });
        }
    }

    public async clearHistory(): Promise<void> {
        await this.contextManager.clear();
        
        if (this.view) {
            this.view.webview.postMessage({
                type: 'clearMessages'
            });
        }
    }

    public dispose() {
        // Cleanup if needed
    }
}
