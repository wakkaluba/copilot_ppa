"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const ConversationManager_1 = require("../../services/ConversationManager");
const WorkspaceManager_1 = require("../../services/WorkspaceManager");
suite('ConversationManager Tests', () => {
    let conversationManager;
    let workspaceManagerStub;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        // Create stub for WorkspaceManager
        workspaceManagerStub = sandbox.createStubInstance(WorkspaceManager_1.WorkspaceManager);
        // Replace the getInstance method to return our stub
        sandbox.stub(WorkspaceManager_1.WorkspaceManager, 'getInstance').returns(workspaceManagerStub);
        // Create a fresh instance of ConversationManager for each test
        conversationManager = ConversationManager_1.ConversationManager.getInstance();
    });
    teardown(() => {
        sandbox.restore();
    });
    test('getInstance should return singleton instance', () => {
        const instance1 = ConversationManager_1.ConversationManager.getInstance();
        const instance2 = ConversationManager_1.ConversationManager.getInstance();
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
//# sourceMappingURL=ConversationManager.test.js.map