import * as vscode from 'vscode';
import { ChatMessage, Conversation } from '../../services/ConversationHistory';
export declare function createMockExtensionContext(): vscode.ExtensionContext;
export declare function createMockConversation(id?: string, title?: string): Conversation;
export declare function createMockMessage(role?: 'user' | 'assistant' | 'system', content?: string): ChatMessage;
