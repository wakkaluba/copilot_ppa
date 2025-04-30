import { ContextManager } from './ContextManager';
export declare class PromptManager {
    private contextManager;
    constructor(contextManager: ContextManager);
    createPrompt(userInput: string): string;
}
