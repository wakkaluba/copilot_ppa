import * as assert from 'assert';
import * as sinon from 'sinon';
import { ConversationManager } from '../../services/conversationManager';
import { WorkspaceManager } from '../../services/WorkspaceManager';
import { ChatMessage } from '../../types/conversation';

describe('ConversationManager', () => {
    let conversationManager: ConversationManager;
    let sandbox: sinon.SinonSandbox;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let originalGetInstance: typeof WorkspaceManager.getInstance;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        // Store original getInstance
        originalGetInstance = WorkspaceManager.getInstance;
        
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        
        // Replace the getInstance method to return our stub
        WorkspaceManager.getInstance = sandbox.stub().returns(workspaceManagerStub as unknown as WorkspaceManager);
        
        // Reset ConversationManager singleton instance
        (ConversationManager as any).instance = undefined;
        
        conversationManager = ConversationManager.getInstance();
    });

    afterEach(() => {
        sandbox.restore();
        WorkspaceManager.getInstance = originalGetInstance;
    });

    it('should start a new conversation', async () => {
        await conversationManager.startNewConversation('Test Conversation');
        // Since currentConversation is private, we can't directly test it
        // Instead we test it indirectly through other methods
        const messages = conversationManager.getCurrentContext();
        assert.deepStrictEqual(messages, []);
    });

    it('should add a message to the current conversation', async () => {
        await conversationManager.startNewConversation('Test Conversation');
        await conversationManager.addMessage('user', 'Hello, world!');
        const messages = conversationManager.getCurrentContext();
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].content, 'Hello, world!');
    });

    it('should return an empty array if no conversation is started', () => {
        const messages = conversationManager.getCurrentContext();
        assert.deepStrictEqual(messages, []);
    });

    it('should load a conversation', async () => {
        const conversationData = {
            id: 'test-conversation',
            title: 'Test Conversation',
            messages: [
                {
                    role: 'user',
                    content: 'Hello, world!',
                    timestamp: new Date()
                }
            ],
            created: Date.now(),
            updated: Date.now()
        };
        
        workspaceManagerStub.readFile.resolves(JSON.stringify(conversationData));
        
        const success = await conversationManager.loadConversation('test-conversation');
        assert.strictEqual(success, true);
        
        const messages = conversationManager.getCurrentContext();
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].content, 'Hello, world!');
    });

    it('should list conversations', async () => {
        const conversation1 = {
            id: 'conv1',
            title: 'Conversation 1',
            messages: [],
            created: Date.now() - 1000,
            updated: Date.now() - 1000
        };
        
        const conversation2 = {
            id: 'conv2',
            title: 'Conversation 2',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        
        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile
            .onFirstCall().resolves(JSON.stringify(conversation1))
            .onSecondCall().resolves(JSON.stringify(conversation2));
        
        const conversations = await conversationManager.listConversations();
        assert.strictEqual(conversations.length, 2);
        // Should be sorted by updated time, most recent first
        assert.strictEqual(conversations[0].id, 'conv2');
        assert.strictEqual(conversations[1].id, 'conv1');
    });

    it('should auto-save when adding messages', async () => {
        await conversationManager.startNewConversation('Test Conversation');
        await conversationManager.addMessage('user', 'Hello, world!');
        
        assert.strictEqual(workspaceManagerStub.createDirectory.callCount, 2); // Initial call and auto-save call
        assert.strictEqual(workspaceManagerStub.writeFile.callCount, 2); // Initial call and auto-save call
    });
});