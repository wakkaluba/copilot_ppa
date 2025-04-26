import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { ChatMessage, Conversation, ConversationHistory } from '../../services/ConversationHistory';

/**
 * Creates a mock ConversationHistory instance that can be used in tests
 */
export function createMockConversationHistory(): sinon.SinonStubbedInstance<ConversationHistory> {
    const mockHistory = sinon.createStubInstance(ConversationHistory);
    
    // Add additional methods that aren't automatically detected
    mockHistory.on = sinon.stub().returns(mockHistory);
    mockHistory.emit = sinon.stub().returns(true);
    
    // Implement some standard behaviors
    mockHistory.getConversation = sinon.stub().callsFake((id: string) => {
        return {
            id,
            title: `Mock Conversation ${id}`,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    });
    
    mockHistory.getAllConversations = sinon.stub().returns([]);
    mockHistory.createConversation = sinon.stub().callsFake(async (title: string) => {
        return {
            id: `mock-${Date.now()}`,
            title,
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
    });
    
    mockHistory.addMessage = sinon.stub().resolves();
    mockHistory.deleteConversation = sinon.stub().resolves();
    mockHistory.searchConversations = sinon.stub().resolves([]);
    mockHistory.exportConversation = sinon.stub().resolves("{}");
    mockHistory.importConversation = sinon.stub().resolves({
        id: "imported-conversation",
        title: "Imported Conversation",
        messages: [],
        created: Date.now(),
        updated: Date.now()
    });
    
    return mockHistory;
}

/**
 * Creates a mock ExtensionContext that can be used in tests
 */
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
        secrets: {
            get: sinon.stub().resolves(undefined),
            store: sinon.stub().resolves(),
            delete: sinon.stub().resolves()
        }
    };
}

/**
 * Creates a mock conversation that can be used in tests
 */
export function createMockConversation(id: string = 'test-conversation', title: string = 'Test Conversation'): Conversation {
    return {
        id,
        title,
        messages: [],
        created: Date.now(),
        updated: Date.now()
    };
}

/**
 * Creates a mock chat message that can be used in tests
 */
export function createMockMessage(role: 'user' | 'assistant' | 'system' = 'user', content: string = 'Test message'): ChatMessage {
    return {
        role,
        content,
        timestamp: new Date()
    };
}