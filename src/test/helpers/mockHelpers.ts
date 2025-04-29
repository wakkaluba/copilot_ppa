import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { ChatMessage, Conversation, ConversationHistory } from '../../services/ConversationHistory';

export function createMockExtensionContext(): vscode.ExtensionContext {
    return {
        subscriptions: [],
        workspaceState: {
            get: sinon.stub().returns(undefined),
            update: sinon.stub().resolves(),
            keys: sinon.stub().returns([])
        } as any,
        globalState: {
            get: sinon.stub().returns(undefined),
            update: sinon.stub().resolves(),
            setKeysForSync: sinon.stub(),
            keys: sinon.stub().returns([])
        } as any,
        extensionPath: '/test/extension/path',
        extensionUri: { 
            fsPath: '/test/extension/path',
            scheme: 'file'
        } as any,
        asAbsolutePath: sinon.stub().callsFake((p: string) => `/test/extension/path/${p}`),
        storagePath: '/test/storage/path',
        storageUri: { 
            fsPath: '/test/storage/path',
            scheme: 'file'
        } as any,
        globalStoragePath: '/test/global-storage/path',
        globalStorageUri: { 
            fsPath: '/test/global-storage/path',
            scheme: 'file'
        } as any,
        logPath: '/test/log/path',
        logUri: { 
            fsPath: '/test/log/path',
            scheme: 'file'
        } as any,
        extensionMode: vscode.ExtensionMode.Test,
        environmentVariableCollection: {
            persistent: true,
            replace: sinon.stub(),
            append: sinon.stub(), 
            prepend: sinon.stub(),
            get: sinon.stub(),
            forEach: sinon.stub(),
            delete: sinon.stub(),
            clear: sinon.stub(),
            [Symbol.iterator]: function* () { yield* []; }
        } as any,
        secrets: {
            get: sinon.stub().resolves(undefined),
            store: sinon.stub().resolves(),
            delete: sinon.stub().resolves(),
            onDidChange: new vscode.EventEmitter<string>().event
        }
    };
}

export function createMockConversation(id: string = 'test-conversation', title: string = 'Test Conversation'): Conversation {
    return {
        id,
        title,
        messages: [],
        created: Date.now(),
        updated: Date.now()
    };
}

export function createMockMessage(role: 'user' | 'assistant' | 'system' = 'user', content: string = 'Test message'): ChatMessage {
    return {
        role,
        content,
        timestamp: new Date()
    };
}