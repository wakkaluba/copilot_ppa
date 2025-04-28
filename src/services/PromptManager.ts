import { ContextManager } from './contextManager';

export class PromptManager {
    private contextManager: ContextManager;
    
    constructor(contextManager: ContextManager) {
        this.contextManager = contextManager;
    }
    
    createPrompt(userInput: string): string {
        const contextString = this.contextManager.buildContextString();
        return `${contextString}\n\nUser: ${userInput}`;
    }
}
