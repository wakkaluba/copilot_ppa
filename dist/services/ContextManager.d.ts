import * as vscode from 'vscode';
import { ContextManager as ConversationContextManager } from './conversation/ContextManager';
/**
 * Re-export the ContextManager from the conversation directory
 * This helps maintain compatibility with existing test imports
 */
export declare class ContextManager {
    private static instance;
    /**
     * Get singleton instance of ContextManager
     * @param context Extension context
     */
    static getInstance(context: vscode.ExtensionContext): ConversationContextManager;
}
