const assert = require('assert');
const vscode = require('vscode');
const path = require('path');
const sinon = require('sinon');
const { Conversation } = require('../../src/models/conversation');
const { Chat } = require('../../src/models/chat');

describe('Conversation Model Tests (JS)', () => {
    let sandbox;
    let mockChat;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create a mock chat
        mockChat = new Chat({
            id: 'chat1',
            title: 'Test Chat',
            messages: [{
                id: 'msg1',
                content: 'Test message',
                role: 'user',
                timestamp: new Date().toISOString()
            }]
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create a new conversation with default properties', () => {
        const conversation = new Conversation();

        assert.ok(conversation.id, 'Conversation should have an ID');
        assert.strictEqual(conversation.chats.length, 0, 'New conversation should have empty chats');
        assert.ok(conversation.createdAt, 'Conversation should have creation timestamp');
        assert.strictEqual(typeof conversation.title, 'string', 'Conversation should have a title');
    });

    it('should create a conversation with provided properties', () => {
        const id = 'test-id';
        const title = 'Test Conversation';
        const chats = [mockChat];

        const conversation = new Conversation({
            id,
            title,
            chats
        });

        assert.strictEqual(conversation.id, id);
        assert.strictEqual(conversation.title, title);
        assert.deepStrictEqual(conversation.chats, chats);
    });

    it('should add a chat to the conversation', () => {
        const conversation = new Conversation();
        conversation.addChat(mockChat);

        assert.strictEqual(conversation.chats.length, 1);
        assert.deepStrictEqual(conversation.chats[0], mockChat);
    });

    it('should update conversation title', () => {
        const conversation = new Conversation();
        const newTitle = 'Updated Title';

        conversation.setTitle(newTitle);

        assert.strictEqual(conversation.title, newTitle);
    });

    it('should delete a chat by id', () => {
        const conversation = new Conversation();
        conversation.addChat(mockChat);

        assert.strictEqual(conversation.chats.length, 1);

        conversation.deleteChat(mockChat.id);

        assert.strictEqual(conversation.chats.length, 0);
    });

    it('should serialize to JSON correctly', () => {
        const conversation = new Conversation();
        conversation.addChat(mockChat);

        const serialized = conversation.toJSON();

        assert.ok(serialized.id);
        assert.ok(serialized.createdAt);
        assert.strictEqual(serialized.chats.length, 1);
    });

    it('should deserialize from JSON correctly', () => {
        const chatData = {
            id: 'chat-id',
            title: 'Chat Title',
            createdAt: new Date().toISOString(),
            messages: [{
                id: 'msg1',
                content: 'Test message',
                role: 'user',
                timestamp: new Date().toISOString()
            }]
        };

        const data = {
            id: 'conversation-id',
            title: 'Conversation Title',
            createdAt: new Date().toISOString(),
            chats: [chatData]
        };

        const conversation = Conversation.fromJSON(data);

        assert.strictEqual(conversation.id, data.id);
        assert.strictEqual(conversation.title, data.title);
        assert.strictEqual(conversation.chats.length, 1);
        assert.strictEqual(conversation.chats[0].id, chatData.id);
    });

    it('should get chat by id', () => {
        const conversation = new Conversation();
        conversation.addChat(mockChat);

        const retrievedChat = conversation.getChatById(mockChat.id);

        assert.deepStrictEqual(retrievedChat, mockChat);
    });

    it('should handle missing chat gracefully', () => {
        const conversation = new Conversation();

        const retrievedChat = conversation.getChatById('non-existent');

        assert.strictEqual(retrievedChat, null);
    });

    it('should update active chat', () => {
        const conversation = new Conversation();
        conversation.addChat(mockChat);

        conversation.setActiveChat(mockChat.id);

        assert.strictEqual(conversation.activeChatId, mockChat.id);
    });
});
