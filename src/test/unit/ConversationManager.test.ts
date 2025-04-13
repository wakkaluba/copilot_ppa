import * as assert from 'assert';
import * as sinon from 'sinon';
import { ConversationManager } from '../../services/ConversationManager';
import { WorkspaceManager } from '../../services/WorkspaceManager';

suite('ConversationManager Tests', () => {
    let conversationManager: ConversationManager;
    let workspaceManagerStub: sinon.SinonStubbedInstance<WorkspaceManager>;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager);
        
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager, 'getInstance').returns(workspaceManagerStub as unknown as WorkspaceManager);
        
        // Create a fresh instance of ConversationManager for each test
        conversationManager = ConversationManager.getInstance();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('getInstance should return singleton instance', () => {
        const instance1 = ConversationManager.getInstance();
        const instance2 = ConversationManager.getInstance();
        assert.strictEqual(instance1, instance2);
    });

    test('startNewConversation should create a new conversation', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        await conversationManager.startNewConversation('Test Conversation');
        
        // Verify that the directory was created
        assert.strictEqual(workspaceManagerStub.createDirectory.calledOnce, true);
        
        // Verify that writeFile was called to save the conversation
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        
        // Verify the content of the saved conversation
        const writeFileCall = workspaceManagerStub.writeFile.getCall(0);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'Test Conversation');
        assert.deepStrictEqual(savedContent.messages, []);
    });

    test('addMessage should add a message to the current conversation', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        // Start with a new conversation
        await conversationManager.startNewConversation('Test Conversation');
        
        // Add a message
        await conversationManager.addMessage('user', 'Hello, world!');
        
        // Verify that writeFile was called to save the conversation
        assert.strictEqual(workspaceManagerStub.writeFile.callCount, 2); // Once for startNewConversation, once for addMessage
        
        // Verify the content of the saved conversation
        const writeFileCall = workspaceManagerStub.writeFile.getCall(1);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'Test Conversation');
        assert.strictEqual(savedContent.messages.length, 1);
        assert.strictEqual(savedContent.messages[0].role, 'user');
        assert.strictEqual(savedContent.messages[0].content, 'Hello, world!');
    });

    test('addMessage should create a new conversation if none exists', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        // Add a message without starting a conversation first
        await conversationManager.addMessage('user', 'Hello, world!');
        
        // Verify that writeFile was called to save the conversation
        assert.strictEqual(workspaceManagerStub.writeFile.calledOnce, true);
        
        // Verify the content of the saved conversation
        const writeFileCall = workspaceManagerStub.writeFile.getCall(0);
        const savedContent = JSON.parse(writeFileCall.args[1]);
        assert.strictEqual(savedContent.title, 'New Conversation');
        assert.strictEqual(savedContent.messages.length, 1);
        assert.strictEqual(savedContent.messages[0].role, 'user');
        assert.strictEqual(savedContent.messages[0].content, 'Hello, world!');
    });

    test('loadConversation should load an existing conversation', async () => {
        const conversationId = 'test_id';
        const conversationData = {
            id: conversationId,
            title: 'Test Conversation',
            messages: [
                { role: 'user', content: 'Hello', timestamp: Date.now() }
            ],
            created: Date.now(),
            updated: Date.now()
        };
        
        workspaceManagerStub.readFile.resolves(JSON.stringify(conversationData));
        
        const result = await conversationManager.loadConversation(conversationId);
        
        assert.strictEqual(result, true);
        assert.strictEqual(workspaceManagerStub.readFile.calledOnce, true);
        
        // Verify the context contains the loaded message
        const context = conversationManager.getCurrentContext();
        assert.strictEqual(context.length, 1);
        assert.strictEqual(context[0].content, 'Hello');
    });

    test('loadConversation should return false for non-existent conversation', async () => {
        workspaceManagerStub.readFile.rejects(new Error('File not found'));
        
        const result = await conversationManager.loadConversation('nonexistent_id');
        
        assert.strictEqual(result, false);
    });

    test('listConversations should return sorted conversations', async () => {
        const conv1 = {
            id: 'conv1',
            title: 'First Conversation',
            messages: [],
            created: Date.now() - 1000,
            updated: Date.now() - 1000
        };
        
        const conv2 = {
            id: 'conv2',
            title: 'Second Conversation',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        
        workspaceManagerStub.listFiles.resolves(['conversations/conv1.json', 'conversations/conv2.json']);
        workspaceManagerStub.readFile.onFirstCall().resolves(JSON.stringify(conv1));
        workspaceManagerStub.readFile.onSecondCall().resolves(JSON.stringify(conv2));
        
        const conversations = await conversationManager.listConversations();
        
        assert.strictEqual(conversations.length, 2);
        // Should be sorted by updated timestamp (most recent first)
        assert.strictEqual(conversations[0].id, 'conv2');
        assert.strictEqual(conversations[1].id, 'conv1');
    });

    test('getCurrentContext should limit the number of messages returned', async () => {
        workspaceManagerStub.writeFile.resolves();
        workspaceManagerStub.createDirectory.resolves();
        
        await conversationManager.startNewConversation('Test Conversation');
        
        // Add several messages
        for (let i = 0; i < 15; i++) {
            await conversationManager.addMessage('user', `Message ${i}`);
        }
        
        // Get context with default limit (10)
        const defaultContext = conversationManager.getCurrentContext();
        assert.strictEqual(defaultContext.length, 10);
        assert.strictEqual(defaultContext[0].content, 'Message 5');
        assert.strictEqual(defaultContext[9].content, 'Message 14');
        
        // Get context with custom limit
        const customContext = conversationManager.getCurrentContext(5);
        assert.strictEqual(customContext.length, 5);
        assert.strictEqual(customContext[0].content, 'Message 10');
        assert.strictEqual(customContext[4].content, 'Message 14');
    });
});