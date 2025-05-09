import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { ChatMessage, Conversation, Chapter } from './types';
export declare class ConversationHistory extends EventEmitter implements vscode.Disposable {
    private conversations;
    private chapters;
    private context;
    private mainObjectivesFile;
    private storageDir;
    constructor(context: vscode.ExtensionContext);
    private ensureStorageDirectory;
    private getConversationFilePath;
    private loadFromStorage;
    private saveConversationToFile;
    private deleteConversationFile;
    createChapter(title: string, description?: string): Promise<Chapter>;
    addConversationToChapter(conversationId: string, chapterId: string): Promise<void>;
    createConversation(title: string): Promise<Conversation>;
    getConversation(id: string): Conversation | undefined;
    getAllConversations(): Conversation[];
    addMessage(conversationId: string, message: ChatMessage): Promise<void>;
    updateConversationTitle(conversationId: string, title: string): Promise<void>;
    deleteConversation(conversationId: string): Promise<void>;
    clearAllConversations(): Promise<void>;
    searchConversations(query: string): Promise<Conversation[]>;
    exportConversation(conversationId: string): Promise<string>;
    importConversation(jsonData: string): Promise<Conversation>;
    forgetMessage(conversationId: string, messageId: string): Promise<void>;
    updateProjectObjectives(objectives: string[]): Promise<void>;
    getProjectObjectives(): Promise<string[]>;
    addMessageReference(messageId: string, referenceMessageId: string): Promise<void>;
    getAllChapters(): Chapter[];
    getChapter(id: string): Chapter | undefined;
    deleteChapter(chapterId: string): Promise<void>;
    dispose(): void;
}
