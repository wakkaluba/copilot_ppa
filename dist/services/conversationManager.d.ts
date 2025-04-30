import { ChatMessage } from '../types/conversation';
export declare class ConversationManager {
    private static instance;
    private workspaceManager;
    private currentConversation;
    private historyPath;
    private constructor();
    static getInstance(): ConversationManager;
    startNewConversation(title: string): Promise<void>;
    addMessage(role: 'user' | 'assistant' | 'system', content: string): Promise<void>;
    loadConversation(id: string): Promise<boolean>;
    listConversations(): Promise<Array<{
        id: string;
        title: string;
        updated: number;
    }>>;
    getCurrentContext(maxMessages?: number): ChatMessage[];
    private autoSave;
    private saveCurrentConversation;
    private generateId;
}
