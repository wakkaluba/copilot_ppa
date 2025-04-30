import * as vscode from 'vscode';
import { ConversationMessage, IConversationMemory } from './types';
export declare class ConversationMemory implements IConversationMemory {
    private readonly _context;
    private _messages;
    private readonly _storageKey;
    private readonly _maxHistorySize;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    addMessage(message: ConversationMessage): void;
    getRecentMessages(limit: number): ConversationMessage[];
    getAllMessages(): ConversationMessage[];
    clearHistory(): Promise<void>;
    searchMessages(term: string): ConversationMessage[];
    getMessagesByDateRange(startTime: number, endTime: number): ConversationMessage[];
    private saveToStorage;
}
