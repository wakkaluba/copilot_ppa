import * as vscode from 'vscode';
import { v4 as uuidv4 } from 'uuid';
import { IContextManager, ILLMProvider, IChatMessage } from '../models';

export class EnhancedChatProvider {
    private contextManager: IContextManager;
    private llmProvider: ILLMProvider;
    private view?: vscode.WebviewView;
    private isStreaming: boolean = false;
    private offlineCache: Map<string, IChatMessage[]> = new Map();
    private readonly maxRetries: number = 3;
    
    constructor(
        context: vscode.ExtensionContext, 
        contextManager: IContextManager, 
        llmProvider: ILLMProvider
    ) {
        this.contextManager = contextManager;
        this.llmProvider = llmProvider;
    }

    private async handleContinueIteration(): Promise<void> {
        if (!this.view) { return; }
        
        this.view.webview.postMessage({
            type: 'showContinuePrompt',
            message: 'Continue to iterate?'
        });
    }
    
    public setWebview(view: vscode.WebviewView): void {
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

    private renderChatInterface(): void {
        if (!this.view) {return;}
        
        this.sendMessagesToWebview();
        this.updateConnectionStatus();
    }

    private sendMessagesToWebview(): void {
        if (!this.view) {return;}
        
        const messages = this.contextManager.listMessages();
        this.view.webview.postMessage({
            type: 'updateMessages',
            messages
        });
    }

    private updateConnectionStatus(): void {
        if (!this.view) {return;}
        
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

    public async handleUserMessage(content: string): Promise<void> {
        if (!content.trim()) { return; }

        const userMessage: IChatMessage = {
            id: uuidv4(),
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
            } catch (error) {
                retryCount++;
                if (retryCount === this.maxRetries) {
                    throw error;
                }
            }
        }
    }

    private async generateResponse(userMessage: IChatMessage): Promise<void> {
        this.isStreaming = true;
        this.updateStatus('Thinking...');
        
        let currentResponse = '';
        
        try {
            const context = this.contextManager.getContextString();
            await this.llmProvider.generateResponse(
                userMessage.content,
                { context },
                (content: string) => {
                    currentResponse += content;
                    this.updateStreamingContent(currentResponse);
                }
            );
            
            const assistantMessage: IChatMessage = {
                id: uuidv4(),
                role: 'assistant',
                content: currentResponse,
                timestamp: Date.now()
            };
            
            this.contextManager.appendMessage(assistantMessage);
            this.sendMessagesToWebview();
            
        } finally {
            this.isStreaming = false;
            this.updateStatus('');
        }
    }

    private async handleOfflineMode(message: IChatMessage): Promise<void> {
        // Cache message for later sync
        const conversationId = this.contextManager.getCurrentConversationId();
        const cachedMessages = this.offlineCache.get(conversationId) || [];
        cachedMessages.push(message);
        this.offlineCache.set(conversationId, cachedMessages);
        
        const offlineMessage: IChatMessage = {
            id: uuidv4(),
            role: 'system',
            content: 'Currently offline. Message saved and will be processed when connection is restored.',
            timestamp: Date.now()
        };
        
        this.contextManager.appendMessage(offlineMessage);
        this.sendMessagesToWebview();
    }

    private async handleError(error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        const errorResponse: IChatMessage = {
            id: uuidv4(),
            role: 'system',
            content: `Error: ${errorMessage}\nPlease try again or check your connection.`,
            timestamp: Date.now()
        };
        
        this.contextManager.appendMessage(errorResponse);
        this.sendMessagesToWebview();
        this.updateStatus('');
        
        vscode.window.showErrorMessage(`Chat Error: ${errorMessage}`);
    }

    private async waitBeforeRetry(retryCount: number): Promise<void> {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    private updateStreamingContent(content: string): void {
        if (!this.view) {return;}
        
        this.view.webview.postMessage({
            type: 'updateStreamingContent',
            content
        });
    }

    public async syncOfflineMessages(): Promise<void> {
        if (!this.llmProvider.isConnected()) {return;}
        
        const conversationId = this.contextManager.getCurrentConversationId();
        const cachedMessages = this.offlineCache.get(conversationId) || [];
        
        if (cachedMessages.length === 0) {return;}
        
        for (const message of cachedMessages) {
            await this.generateResponse(message);
        }
        
        this.offlineCache.delete(conversationId);
    }

    private updateStatus(status: string): void {
        if (!this.view) {return;}
        
        this.view.webview.postMessage({
            type: 'updateStatus',
            status
        });
    }

    private async createCodeSnippet(code: string, language: string): Promise<void> {
        try {
            const snippet = new vscode.SnippetString(code);
            const doc = await vscode.workspace.openTextDocument({
                language: language || 'text',
                content: ''
            });
            
            const editor = await vscode.window.showTextDocument(doc);
            await editor.insertSnippet(snippet);
            
            vscode.window.showInformationMessage('Code snippet created');
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to create snippet: ${errorMessage}`);
        }
    }

    public async clearHistory(): Promise<void> {
        await this.contextManager.clear();
        this.sendMessagesToWebview();
    }

    public dispose() {
        // Cleanup
    }
}
