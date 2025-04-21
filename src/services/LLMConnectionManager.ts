/**
 * @deprecated Use src/services/llm/LLMConnectionManager.ts instead.
 * This class is maintained for backwards compatibility and will be removed in a future version.
 */
import * as vscode from 'vscode';
import { LLMHostManager } from './LLMHostManager';
import { LLMConnectionManager as NewLLMConnectionManager } from './llm/LLMConnectionManager';

/**
 * @deprecated Use the new LLMConnectionManager from services/llm instead
 */
export class LLMConnectionManager {
    private static instance: LLMConnectionManager;
    private readonly newManager: NewLLMConnectionManager;
    
    private constructor() {
        this.newManager = NewLLMConnectionManager.getInstance();
        console.warn('LLMConnectionManager is deprecated. Use services/llm/LLMConnectionManager instead.');
    }

    static getInstance(): LLMConnectionManager {
        if (!this.instance) {
            this.instance = new LLMConnectionManager();
        }
        return this.instance;
    }

    async connectToLLM(): Promise<boolean> {
        return this.newManager.connectToLLM();
    }

    private async handleConnectionFailure(): Promise<boolean> {
        // Forward to new implementation's retry mechanism
        return false; // Let new implementation handle retries
    }

    dispose(): void {
        this.newManager.dispose();
    }
}
