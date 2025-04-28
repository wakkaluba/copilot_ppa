import * as vscode from 'vscode';
import { PromptManager } from './promptManager';
import { LLMProvider } from '../llm/llmProvider';
import { WorkspaceManager } from './workspaceManager';
import { ContextManager } from './contextManager';

export class CoreAgent {
    private promptManager: PromptManager;
    private llmProvider: LLMProvider;
    private workspaceManager: WorkspaceManager;
    private contextManager: ContextManager;

    constructor(
        context: vscode.ExtensionContext,
        contextManager: ContextManager,
        llmProvider?: LLMProvider,
        workspaceManager?: WorkspaceManager,
        promptManager?: PromptManager
    ) {
        this.contextManager = contextManager;
        this.llmProvider = llmProvider || new LLMProvider();
        this.workspaceManager = workspaceManager || WorkspaceManager.getInstance();
        this.promptManager = promptManager || new PromptManager(this.contextManager);
    }

    async processInput(input: string): Promise<{ response: any }> {
        try {
            const enhancedPrompt = this.promptManager.createPrompt(input);
            const response = await this.llmProvider.generateResponse(enhancedPrompt);
            return { response };
        } catch (error) {
            this.contextManager.addMessage({
                role: 'system',
                content: `Error: ${error.message}`,
                timestamp: new Date()
            });
            throw new Error(`Failed to process input: ${error.message}`);
        }
    }

    getSuggestions(input: string): string[] {
        return this.contextManager.generateSuggestions(input);
    }

    async clearContext(): Promise<void> {
        try {
            await this.contextManager.clearAllContextData();
        } catch (error) {
            throw new Error(`Failed to clear context: ${error.message}`);
        }
    }

    dispose(): void {
        // Clean up resources
        this.llmProvider.dispose?.();
    }
}
