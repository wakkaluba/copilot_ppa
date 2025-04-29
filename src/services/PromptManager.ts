import { ContextManager } from './ContextManager';
import { ContextManager as ConversationContextManager } from './conversation/ContextManager';

export class PromptManager {
    private contextManager: any; // Using any temporarily to resolve type issues
    
    constructor(contextManager: ContextManager) {
        this.contextManager = contextManager;
    }
    
    createPrompt(userInput: string): string {
        // Call buildContextString which is available in the actual implementation
        const contextString = this.contextManager.buildContextString();
        return `${contextString}\n\nUser: ${userInput}`;
    }
}
