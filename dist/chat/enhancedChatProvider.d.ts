import * as vscode from 'vscode';
import { IContextManager, ILLMProvider } from '../models';
export declare class EnhancedChatProvider {
    private contextManager;
    private llmProvider;
    private view?;
    private isStreaming;
    private offlineCache;
    private readonly maxRetries;
    constructor(context: vscode.ExtensionContext, contextManager: IContextManager, llmProvider: ILLMProvider);
    private handleContinueIteration;
    setWebview(view: vscode.WebviewView): void;
    private renderChatInterface;
    private sendMessagesToWebview;
    private updateConnectionStatus;
    handleUserMessage(content: string): Promise<void>;
    private generateResponse;
    private handleOfflineMode;
    private handleError;
    private waitBeforeRetry;
    private updateStreamingContent;
    syncOfflineMessages(): Promise<void>;
    private updateStatus;
    private createCodeSnippet;
    clearHistory(): Promise<void>;
    dispose(): void;
}
