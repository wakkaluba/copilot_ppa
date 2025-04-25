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
const conversationManager_1 = require("../../services/conversationManager"); // Fixed casing to match actual file
describe('ConversationManager', () => {
    let conversationManager;
    let sandbox;
    let storageStub;
    let mockContext;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        storageStub = {
            getItem: sandbox.stub(),
            setItem: sandbox.stub(),
            removeItem: sandbox.stub()
        };
        mockContext = {
            currentConversationId: null,
            conversations: {}
        };
        conversationManager = new conversationManager_1.ConversationManager(storageStub, mockContext);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should start a new conversation', () => {
        conversationManager.startNewConversation('Test Conversation');
        assert.strictEqual(conversationManager.getCurrentConversationId(), 'Test Conversation');
    });
    it('should add a message to the current conversation', () => {
        conversationManager.startNewConversation('Test Conversation');
        conversationManager.addMessage('user', 'Hello, world!');
        const messages = conversationManager.getCurrentContext();
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].content, 'Hello, world!');
    });
    it('should return an empty array if no conversation is started', () => {
        const messages = conversationManager.getCurrentContext();
        assert.deepStrictEqual(messages, []);
    });
    it('should search messages in all conversations', () => {
        conversationManager.startNewConversation('Test Conversation 1');
        conversationManager.addMessage('user', 'Hello');
        conversationManager.startNewConversation('Test Conversation 2');
        conversationManager.addMessage('user', 'World');
        const results = conversationManager.searchMessages('Hello');
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].content, 'Hello');
    });
    it('should delete a conversation', () => {
        conversationManager.startNewConversation('Test Conversation');
        conversationManager.addMessage('user', 'Hello, world!');
        conversationManager.deleteConversation('Test Conversation');
        assert.strictEqual(conversationManager.getCurrentConversationId(), null);
    });
    it('should merge two conversations', () => {
        conversationManager.startNewConversation('Test Conversation 1');
        conversationManager.addMessage('user', 'Message 1');
        conversationManager.startNewConversation('Test Conversation 2');
        conversationManager.addMessage('user', 'Message 2');
        conversationManager.mergeConversations('Test Conversation 1', 'Test Conversation 2');
        const messages = conversationManager.getCurrentContext();
        assert.strictEqual(messages.length, 2);
        assert.strictEqual(messages[0].content, 'Message 1');
        assert.strictEqual(messages[1].content, 'Message 2');
    });
    it('should handle concurrent conversation updates', async () => {
        const conversation = {
            id: 'concurrent-test',
            title: 'Concurrent Test',
            messages: [],
            created: Date.now(),
            updated: Date.now()
        };
        workspaceManagerStub.readFile.resolves(JSON.stringify(conversation));
        workspaceManagerStub.writeFile.resolves();
        // Simulate concurrent updates
        const update1 = conversationManager.addMessage({
            role: 'user',
            content: 'Message 1',
            timestamp: Date.now()
        });
        const update2 = conversationManager.addMessage({
            role: 'user',
            content: 'Message 2',
            timestamp: Date.now()
        });
        await Promise.all([update1, update2]);
        // Both messages should be saved
        const messages = await conversationManager.getCurrentContext();
        assert.strictEqual(messages.length, 2);
    });
    it('should recover from corrupted conversation files', async () => {
        workspaceManagerStub.listFiles.resolves(['conversations/corrupted.json']);
        workspaceManagerStub.readFile.rejects(new Error('Invalid JSON'));
        // Should not throw error and return empty array
        const conversations = await conversationManager.listConversations();
        assert.strictEqual(conversations.length, 0);
    });
    it('should maintain correct message order during merges', async () => {
        const conv1 = {
            id: 'conv1',
            title: 'First Conv',
            messages: [
                { role: 'user', content: 'Message 1', timestamp: Date.now() - 3000 },
                { role: 'assistant', content: 'Response 1', timestamp: Date.now() - 2000 }
            ],
            created: Date.now() - 3000,
            updated: Date.now() - 2000
        };
        const conv2 = {
            id: 'conv2',
            title: 'Second Conv',
            messages: [
                { role: 'user', content: 'Message 2', timestamp: Date.now() - 1000 },
                { role: 'assistant', content: 'Response 2', timestamp: Date.now() }
            ],
            created: Date.now() - 1000,
            updated: Date.now()
        };
        workspaceManagerStub.readFile
            .onFirstCall().resolves(JSON.stringify(conv1))
            .onSecondCall().resolves(JSON.stringify(conv2));
        const mergedId = await conversationManager.mergeConversations(['conv1', 'conv2'], 'Merged Conv');
        const merged = await conversationManager.loadConversation(mergedId);
        assert.strictEqual(merged.messages.length, 4);
        assert.strictEqual(merged.messages[0].content, 'Message 1');
        assert.strictEqual(merged.messages[3].content, 'Response 2');
    });
});
//# sourceMappingURL=ConversationManager.test.js.map