import * as vscode from 'vscode';
import { ContextManager as ConversationContextManager } from './conversation/ContextManager';

/**
 * Re-export the ContextManager from the conversation directory
 * This helps maintain compatibility with existing test imports
 */
export class ContextManager {
    private static instance: ConversationContextManager | undefined;

    /**
     * Get singleton instance of ContextManager
     * @param context Extension context
     */
    public static getInstance(context: vscode.ExtensionContext): ConversationContextManager {
        if (!this.instance) {
            this.instance = ConversationContextManager.getInstance(context);
        }
        return this.instance;
    }
}
