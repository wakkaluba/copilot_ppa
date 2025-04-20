import * as vscode from 'vscode';
import { ConversationMessage, IConversationMemory } from './types';

export class ConversationMemory implements IConversationMemory {
    private readonly _context: vscode.ExtensionContext;
    private _messages: ConversationMessage[] = [];
    private readonly _storageKey = 'conversationMemory';
    private readonly _maxHistorySize = 200; // Store up to 200 messages

    constructor(context: vscode.ExtensionContext) {
        this._context = context;
    }

    async initialize(): Promise<void> {
        try {
            const storedData = this._context.globalState.get<ConversationMessage[]>(this._storageKey);
            if (storedData && Array.isArray(storedData)) {
                this._messages = storedData;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Failed to initialize conversation memory:', errorMessage);
            throw new Error(`Failed to initialize conversation memory: ${errorMessage}`);
        }
    }

    addMessage(message: ConversationMessage): void {
        this._messages.push(message);

        // Trim history if it exceeds the maximum size
        if (this._messages.length > this._maxHistorySize) {
            this._messages = this._messages.slice(-this._maxHistorySize);
        }

        // Save to storage
        this.saveToStorage().catch(error => {
            console.error('Failed to save conversation memory:', error);
        });
    }

    getRecentMessages(limit: number): ConversationMessage[] {
        return this._messages.slice(-limit);
    }

    getAllMessages(): ConversationMessage[] {
        return [...this._messages];
    }

    async clearHistory(): Promise<void> {
        try {
            this._messages = [];
            await this._context.globalState.update(this._storageKey, []);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear conversation history: ${errorMessage}`);
        }
    }

    searchMessages(term: string): ConversationMessage[] {
        const lowerTerm = term.toLowerCase();
        return this._messages.filter(msg =>
            msg.content.toLowerCase().includes(lowerTerm)
        );
    }

    getMessagesByDateRange(startTime: number, endTime: number): ConversationMessage[] {
        return this._messages.filter(msg =>
            msg.timestamp >= startTime && msg.timestamp <= endTime
        );
    }

    private async saveToStorage(): Promise<void> {
        try {
            await this._context.globalState.update(this._storageKey, this._messages);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save conversation memory: ${errorMessage}`);
        }
    }
}